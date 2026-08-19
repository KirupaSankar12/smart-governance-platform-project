package com.civicpulse.grievance_service.service;

import com.civicpulse.grievance_service.entity.Complaint;
import com.civicpulse.grievance_service.entity.Complaint.ComplaintStatus;
import com.civicpulse.grievance_service.entity.ComplaintHistory;
import com.civicpulse.grievance_service.entity.Officer;
import com.civicpulse.grievance_service.dto.DashboardStats;
import com.civicpulse.grievance_service.event.ComplaintEvent;
import com.civicpulse.grievance_service.repository.ComplaintHistoryRepository;
import com.civicpulse.grievance_service.repository.ComplaintRepository;
import com.civicpulse.grievance_service.repository.OfficerRepository;
import com.civicpulse.grievance_service.dto.NotificationEvent;
import com.civicpulse.grievance_service.exception.DuplicateApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.civicpulse.grievance_service.dto.DuplicateDetectionDTOs.*;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final OfficerRepository officerRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final KafkaProducerService kafkaProducerService;
    private final KafkaTemplate<String, ComplaintEvent> complaintEventKafkaTemplate;
    private final DuplicateDetectionService duplicateDetectionService;
    private final EmbeddingService embeddingService;

    /**
     * Legal status transitions — enforces the lifecycle:
     * NEW → ASSIGNED → IN_PROGRESS → PENDING/RESOLVED → CLOSED
     */
    private static final Map<ComplaintStatus, EnumSet<ComplaintStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(ComplaintStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(ComplaintStatus.NEW,
                EnumSet.of(ComplaintStatus.ASSIGNED));
        ALLOWED_TRANSITIONS.put(ComplaintStatus.ASSIGNED,
                EnumSet.of(ComplaintStatus.IN_PROGRESS, ComplaintStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(ComplaintStatus.IN_PROGRESS,
                EnumSet.of(ComplaintStatus.PENDING, ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(ComplaintStatus.PENDING,
                EnumSet.of(ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(ComplaintStatus.RESOLVED,
                EnumSet.of(ComplaintStatus.CLOSED));
        ALLOWED_TRANSITIONS.put(ComplaintStatus.CLOSED,
                EnumSet.noneOf(ComplaintStatus.class));  // terminal — no further transitions
        ALLOWED_TRANSITIONS.put(ComplaintStatus.REJECTED,
                EnumSet.noneOf(ComplaintStatus.class));  // terminal — no further transitions
    }

    public ComplaintService(ComplaintRepository complaintRepository,
                            OfficerRepository officerRepository,
                            ComplaintHistoryRepository historyRepository,
                            KafkaProducerService kafkaProducerService,
                            KafkaTemplate<String, ComplaintEvent> complaintEventKafkaTemplate,
                            DuplicateDetectionService duplicateDetectionService,
                            EmbeddingService embeddingService) {
        this.complaintRepository = complaintRepository;
        this.officerRepository = officerRepository;
        this.historyRepository = historyRepository;
        this.kafkaProducerService = kafkaProducerService;
        this.complaintEventKafkaTemplate = complaintEventKafkaTemplate;
        this.duplicateDetectionService = duplicateDetectionService;
        this.embeddingService = embeddingService;
    }

    // ----------------------------------------------------------------
    // DEPARTMENT MAPPING UTILITIES
    // ----------------------------------------------------------------


    // ----------------------------------------------------------------
    // DUPLICATE DETECTION & LINKING
    // ----------------------------------------------------------------

    public DuplicateCheckResponse checkDuplicates(DuplicateCheckRequest request) {
        return duplicateDetectionService.detectDuplicates(request);
    }

    public Complaint linkComplaintToPrimary(LinkComplaintRequest request) {
        if (request.getPrimaryComplaintId() == null) {
            throw new IllegalArgumentException("Primary complaint ID is required to link duplicate complaint.");
        }

        Complaint primary = complaintRepository.findById(request.getPrimaryComplaintId())
                .orElseThrow(() -> new IllegalArgumentException("Primary complaint not found with ID: " + request.getPrimaryComplaintId()));

        // Increment related complaint count on primary complaint
        int currentCount = primary.getRelatedComplaintCount() != null ? primary.getRelatedComplaintCount() : 0;
        primary.setRelatedComplaintCount(currentCount + 1);
        complaintRepository.save(primary);

        // Create linked complaint record representing citizen's report
        Complaint linkedReport = new Complaint();
        linkedReport.setCitizenId(request.getCitizenId() != null ? request.getCitizenId() : "ANONYMOUS");
        linkedReport.setTitle(request.getTitle() != null ? request.getTitle() : primary.getTitle());
        linkedReport.setDescription(request.getDescription() != null ? request.getDescription() : primary.getDescription());
        linkedReport.setDepartment(primary.getDepartment());
        linkedReport.setCategory(primary.getCategory());
        linkedReport.setLocation(request.getLocation() != null ? request.getLocation() : primary.getLocation());
        linkedReport.setPriority(primary.getPriority());
        linkedReport.setStatus(ComplaintStatus.NEW);
        linkedReport.setDuplicateOf(primary.getComplaintId());
        linkedReport.setAssignedOfficer(primary.getAssignedOfficer());

        LocalDateTime now = LocalDateTime.now();
        linkedReport.setCreatedAt(now);
        linkedReport.setSlaDeadline(primary.getSlaDeadline());

        Complaint savedLinked = complaintRepository.save(linkedReport);
        logHistory(savedLinked.getComplaintId(), null, savedLinked.getStatus().name(), "Citizen report linked to primary complaint CMP-" + primary.getComplaintId().toString().substring(0, 8));

        return primary;
    }

    public List<Complaint> getRelatedComplaints(UUID primaryComplaintId) {
        return complaintRepository.findByDuplicateOf(primaryComplaintId);
    }

    // ----------------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------------
    public Complaint createComplaint(Complaint complaint) {
        // Enforce Single Active Application Rule — fingerprint: citizen + department + category + normalized location
        java.util.List<ComplaintStatus> terminalStatuses = java.util.Arrays.asList(
                ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED
        );
        String normalizedLocation = normalizeLocation(complaint.getLocation());
        java.util.Optional<Complaint> existing = complaintRepository.findActiveDuplicate(
                complaint.getCitizenId(), complaint.getDepartment(), complaint.getCategory(), normalizedLocation, terminalStatuses
        );
        if (existing.isPresent()) {
            throw new DuplicateApplicationException("You already have an active complaint for this issue.", existing.get());
        }

        LocalDateTime now = LocalDateTime.now();
        complaint.setCreatedAt(now);

        if (complaint.getStatus() == null)   complaint.setStatus(ComplaintStatus.NEW);
        if (complaint.getPriority() == null) complaint.setPriority(Complaint.Priority.MEDIUM);

        // Auto-assign officer based on department using database mapping
        if (complaint.getDepartment() != null) {
            String dept = complaint.getDepartment();
            List<Officer> officers = officerRepository.findByDepartmentIgnoreCase(dept);
            if (officers.isEmpty()) {
                // Fuzzy match fallback (e.g. "Electricity" matching "Electricity Department")
                List<Officer> allOfficers = officerRepository.findAll();
                officers = allOfficers.stream()
                        .filter(o -> o.getDepartment() != null &&
                                (o.getDepartment().toLowerCase().contains(dept.toLowerCase()) ||
                                 dept.toLowerCase().contains(o.getDepartment().toLowerCase().replace("department", "").trim())))
                        .toList();
            }
            if (!officers.isEmpty()) {
                String assignedOfficer = officers.get(0).getName();
                complaint.setAssignedOfficer(assignedOfficer);
                complaint.setStatus(ComplaintStatus.ASSIGNED); // Automatically transition to ASSIGNED
            }
        }

        // Calculate SLA deadline from priority
        LocalDateTime sla;
        if (complaint.getPriority() == Complaint.Priority.HIGH) {
            sla = now.plusHours(24);
        } else if (complaint.getPriority() == Complaint.Priority.LOW) {
            sla = now.plusDays(7);
        } else {
            sla = now.plusDays(3);
        }
        complaint.setSlaDeadline(sla);

        // Generate text embedding vector and record which model produced it
        try {
            String fullText = (complaint.getTitle() != null ? complaint.getTitle() : "") + " " + (complaint.getDescription() != null ? complaint.getDescription() : "");
            EmbeddingService.EmbeddingResult embResult = embeddingService.getEmbeddingWithSource(fullText);
            if (embResult.vector() != null && embResult.vector().length > 0) {
                complaint.setEmbeddingJson(embeddingService.toJson(embResult.vector()));
                complaint.setEmbeddingModel(embResult.source());
            }
        } catch (Exception e) {
            log.warn("Could not generate embedding for new complaint: {}", e.getMessage());
        }

        Complaint saved = complaintRepository.save(complaint);

        // Log the initial creation in history
        logHistory(saved.getComplaintId(), null, saved.getStatus().name(), "Complaint filed by citizen");

        // Kafka: typed complaint-created event
        ComplaintEvent createdEvent = new ComplaintEvent(
                "complaint-submitted",
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getDepartment(),
                null,
                saved.getStatus().name(),
                saved.getAssignedOfficer(),
                "Complaint successfully submitted",
                now
        );
        try {
            complaintEventKafkaTemplate.send("complaint-submitted", saved.getComplaintId().toString(), createdEvent);
            log.info("Published complaint-submitted event for complaintId={}", saved.getComplaintId());
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed for complaint-submitted: {}", e.getMessage());
        }

        // Kafka notification to citizen (legacy notification channel - non-blocking)
        try {
            kafkaProducerService.sendNotification(new NotificationEvent(
                    saved.getComplaintId(),
                    saved.getCitizenId(),
                    null,
                    "CREATED",
                    "Your complaint '" + saved.getTitle() + "' has been successfully filed.",
                    saved.getCitizenId(),
                    now
            ));
        } catch (Exception ke) {
            log.warn("Legacy notification send failed (non-blocking): {}", ke.getMessage());
        }

        // Send Kafka notification to officer if auto-assigned
        if (saved.getAssignedOfficer() != null) {
            try {
                kafkaProducerService.sendNotification(new NotificationEvent(
                        saved.getComplaintId(),
                        saved.getCitizenId(),
                        saved.getAssignedOfficer(),
                        "ASSIGNED",
                        "You have been assigned a new complaint: '" + saved.getTitle() + "'",
                        saved.getAssignedOfficer(),
                        now
                ));
            } catch (Exception ke) {
                log.warn("Legacy officer notification send failed (non-blocking): {}", ke.getMessage());
            }
        }

        return saved;
    }

    public Page<Complaint> getAll(Pageable pageable) {
        return complaintRepository.findAll(pageable);
    }

    public Page<Complaint> getByOfficer(String username, Pageable pageable) {
        if (username == null || username.trim().isEmpty()) {
            return complaintRepository.findByAssignedOfficer(username, pageable);
        }

        java.util.List<Officer> allOfficers = officerRepository.findAll();
        java.util.Optional<Officer> officerOpt = allOfficers.stream()
                .filter(o -> {
                    if (o.getName() != null && username.toLowerCase().contains(o.getName().toLowerCase())) {
                        return true;
                    }
                    if (o.getDepartment() != null) {
                        String cleanDept = o.getDepartment().toLowerCase()
                                .replace("department", "")
                                .replace("corporation", "")
                                .replace("planning", "")
                                .replace(" ", "")
                                .trim();
                        if (!cleanDept.isEmpty() && username.toLowerCase().contains(cleanDept)) {
                            return true;
                        }
                    }
                    return false;
                })
                .findFirst();

        if (officerOpt.isPresent()) {
            String officerDept = officerOpt.get().getDepartment();
            String officerName = officerOpt.get().getName();
            String deptKeyword = officerDept != null ? officerDept.toLowerCase().replace("department", "").trim() : "";
            
            return complaintRepository.findByDepartmentOrAssignedOfficer(officerDept, deptKeyword, officerName, username, pageable);
        }
        // Fallback for unknown users (e.g. admin or missing mapping)
        return complaintRepository.findByAssignedOfficer(username, pageable);
    }

    public Complaint assignOfficer(UUID complaintId, String officerUsername) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        String previousStatus = complaint.getStatus().name();
        validateTransition(complaint.getStatus(), ComplaintStatus.ASSIGNED);

        complaint.setAssignedOfficer(officerUsername);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);
        logHistory(complaintId, previousStatus, "ASSIGNED", "Manually assigned to officer: " + officerUsername);

        LocalDateTime now = LocalDateTime.now();

        // Publish Kafka event complaint-assigned
        ComplaintEvent assignedEvent = new ComplaintEvent(
                "complaint-assigned",
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getDepartment(),
                previousStatus,
                saved.getStatus().name(),
                saved.getAssignedOfficer(),
                "Assigned to " + officerUsername,
                now
        );
        try {
            complaintEventKafkaTemplate.send("complaint-assigned", saved.getComplaintId().toString(), assignedEvent);
            log.info("Published complaint-assigned event for complaintId={}", saved.getComplaintId());
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed for complaint-assigned: {}", e.getMessage());
        }

        // Send Kafka notification to citizen
        kafkaProducerService.sendNotification(new NotificationEvent(
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getAssignedOfficer(),
                "STATUS_UPDATED",
                "Your complaint '" + saved.getTitle() + "' has been assigned to officer: " + officerUsername,
                saved.getCitizenId(),
                now
        ));

        // Send Kafka notification to officer
        kafkaProducerService.sendNotification(new NotificationEvent(
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getAssignedOfficer(),
                "ASSIGNED",
                "You have been assigned a new complaint: '" + saved.getTitle() + "'",
                officerUsername,
                now
        ));

        return saved;
    }

    // ----------------------------------------------------------------
    // ASSIGN — auto-picks first available officer in the department
    // ----------------------------------------------------------------
    public Complaint assignComplaint(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        validateTransition(complaint.getStatus(), ComplaintStatus.ASSIGNED);

        List<Officer> officers = officerRepository.findByDepartmentIgnoreCase(complaint.getDepartment());
        if (officers.isEmpty()) {
            throw new IllegalStateException(
                "No officers registered for department: '" + complaint.getDepartment() +
                "'. Add officers first via POST /api/officers");
        }

        String previousStatus = complaint.getStatus().name();
        Officer officer = officers.get(0);

        complaint.setAssignedOfficer(officer.getName());
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);
        logHistory(complaintId, previousStatus, "ASSIGNED", "Auto-assigned to officer: " + officer.getName());

        LocalDateTime now = LocalDateTime.now();
        // Kafka notification to citizen
        kafkaProducerService.sendNotification(new NotificationEvent(
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getAssignedOfficer(),
                "STATUS_UPDATED",
                "Your complaint '" + saved.getTitle() + "' has been assigned to officer: " + officer.getName(),
                saved.getCitizenId(),
                now
        ));

        // Kafka notification to assigned officer
        kafkaProducerService.sendNotification(new NotificationEvent(
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getAssignedOfficer(),
                "ASSIGNED",
                "You have been assigned a new complaint: '" + saved.getTitle() + "'",
                officer.getName(),
                now
        ));

        return saved;
    }

    // ----------------------------------------------------------------
    // STATUS UPDATE — enforces valid transitions, logs to history
    // ----------------------------------------------------------------
    public Complaint updateStatus(UUID complaintId, ComplaintStatus newStatus, String remarks) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        String previousStatus = complaint.getStatus().name();
        validateTransition(complaint.getStatus(), newStatus);

        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);
        String finalRemarks = (remarks != null && !remarks.isBlank()) ? remarks : "Status updated to " + newStatus;
        logHistory(complaintId, previousStatus, newStatus.name(), finalRemarks);

        LocalDateTime now = LocalDateTime.now();

        // Kafka: typed complaint-status-changed event
        String eventTopic = "complaint-status-changed";
        if (newStatus == ComplaintStatus.IN_PROGRESS) {
            eventTopic = "complaint-in-progress";
        } else if (newStatus == ComplaintStatus.RESOLVED) {
            eventTopic = "complaint-resolved";
        }

        ComplaintEvent statusEvent = new ComplaintEvent(
                eventTopic,
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getDepartment(),
                previousStatus,
                newStatus.name(),
                saved.getAssignedOfficer(),
                finalRemarks,
                now
        );
        try {
            complaintEventKafkaTemplate.send(eventTopic, saved.getComplaintId().toString(), statusEvent);
            log.info("Published {}: {} -> {}", eventTopic, previousStatus, newStatus);
        } catch (Exception e) {
            log.warn("Kafka event dispatch failed for {}: {}", eventTopic, e.getMessage());
        }

        // Kafka notification to citizen (legacy notification channel)
        kafkaProducerService.sendNotification(new NotificationEvent(
                saved.getComplaintId(),
                saved.getCitizenId(),
                saved.getAssignedOfficer(),
                "STATUS_UPDATED",
                "Your complaint '" + saved.getTitle() + "' status has been updated to " + newStatus + ". Remarks: " + finalRemarks,
                saved.getCitizenId(),
                now
        ));

        // Kafka notification to officer (legacy)
        if (saved.getAssignedOfficer() != null) {
            kafkaProducerService.sendNotification(new NotificationEvent(
                    saved.getComplaintId(),
                    saved.getCitizenId(),
                    saved.getAssignedOfficer(),
                    "STATUS_UPDATED",
                    "Status of assigned complaint '" + saved.getTitle() + "' updated to " + newStatus,
                    saved.getAssignedOfficer(),
                    now
            ));
        }

        return saved;
    }

    // ----------------------------------------------------------------
    // HISTORY — returns the full audit trail for a complaint
    // ----------------------------------------------------------------
    public List<ComplaintHistory> getHistory(UUID complaintId) {
        return historyRepository.findByComplaintIdOrderByTimestampAsc(complaintId);
    }

    // ----------------------------------------------------------------
    // SLA — returns all complaints that are currently OVERDUE
    // ----------------------------------------------------------------
    public List<Complaint> getOverdueComplaints() {
        return complaintRepository.findAll().stream()
                .filter(c -> c.getSlaStatus() == Complaint.SlaStatus.OVERDUE)
                .toList();
    }

    // ----------------------------------------------------------------
    // DASHBOARD STATS
    // ----------------------------------------------------------------
    public DashboardStats getDashboardStats() {
        List<Complaint> all = complaintRepository.findAll();

        long total = all.size();
        long resolved = all.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED).count();
        long overdue = all.stream().filter(c -> c.getSlaStatus() == Complaint.SlaStatus.OVERDUE).count();
        long pending = total - resolved;

        double resolutionRate = total == 0 ? 0.0 : Math.round((resolved * 10000.0 / total)) / 100.0;

        Map<String, Long> byDepartment = all.stream()
                .collect(Collectors.groupingBy(Complaint::getDepartment, Collectors.counting()));

        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority() != null ? c.getPriority().name() : "UNKNOWN", Collectors.counting()));

        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus() != null ? c.getStatus().name() : "UNKNOWN", Collectors.counting()));

        return new DashboardStats(
                total,
                resolved,
                pending,
                overdue,
                resolutionRate,
                byDepartment,
                byPriority,
                byStatus
        );
    }

    // ----------------------------------------------------------------
    // ESCALATION helper — public so EscalationService can also log history
    // ----------------------------------------------------------------
    public void logHistoryPublic(UUID complaintId, String previousStatus, String newStatus, String remarks) {
        logHistory(complaintId, previousStatus, newStatus, remarks);
    }

    // ----------------------------------------------------------------
    // RE-EMBEDDING — regenerate embeddings for active complaints
    // ----------------------------------------------------------------

    /**
     * Regenerates embeddings for all active primary complaints that either have no embedding
     * or were embedded using the old local N-gram fallback (128-dim).
     *
     * <p>Called once after deployment via POST /api/complaints/admin/re-embed.
     * Safe to call multiple times — already-up-to-date complaints are skipped.
     *
     * @return a summary map with counts: total, skipped, updated, failed
     */
    public Map<String, Integer> reEmbedActiveComplaints() {
        List<ComplaintStatus> activeStatuses = java.util.Arrays.asList(
                ComplaintStatus.NEW, ComplaintStatus.ASSIGNED,
                ComplaintStatus.IN_PROGRESS, ComplaintStatus.PENDING
        );

        List<Complaint> activePrimary = complaintRepository.findByStatusIn(activeStatuses)
                .stream()
                .filter(c -> c.getDuplicateOf() == null)  // skip linked duplicates
                .collect(Collectors.toList());

        int total = activePrimary.size();
        int updated = 0;
        int skipped = 0;
        int failed  = 0;

        log.info("[ReEmbed] Starting re-embedding for {} active primary complaints.", total);

        for (Complaint c : activePrimary) {
            // Skip if already has a Gemini embedding
            if (EmbeddingService.SOURCE_GEMINI.equals(c.getEmbeddingModel())) {
                log.debug("[ReEmbed] SKIP complaintId={} already has {} embedding.",
                        c.getComplaintId(), c.getEmbeddingModel());
                skipped++;
                continue;
            }

            try {
                String fullText = (c.getTitle() != null ? c.getTitle() : "")
                        + " " + (c.getDescription() != null ? c.getDescription() : "");

                EmbeddingService.EmbeddingResult result = embeddingService.getEmbeddingWithSource(fullText);

                if (result.vector() != null && result.vector().length > 0) {
                    c.setEmbeddingJson(embeddingService.toJson(result.vector()));
                    c.setEmbeddingModel(result.source());
                    complaintRepository.save(c);
                    log.info("[ReEmbed] UPDATED complaintId={} title='{}' model={} dim={}",
                            c.getComplaintId(), c.getTitle(), result.source(), result.vector().length);
                    updated++;
                } else {
                    log.warn("[ReEmbed] EMPTY vector for complaintId={} — skipping.", c.getComplaintId());
                    failed++;
                }
            } catch (Exception e) {
                log.error("[ReEmbed] FAILED complaintId={}: {}", c.getComplaintId(), e.getMessage());
                failed++;
            }
        }

        log.info("[ReEmbed] Complete. total={} updated={} skipped={} failed={}",
                total, updated, skipped, failed);
        return Map.of("total", total, "updated", updated, "skipped", skipped, "failed", failed);
    }

    // ----------------------------------------------------------------
    // PRIVATE helpers
    // ----------------------------------------------------------------
    private void logHistory(UUID complaintId, String previousStatus, String newStatus, String remarks) {
        ComplaintHistory entry = new ComplaintHistory();
        entry.setComplaintId(complaintId);
        entry.setPreviousStatus(previousStatus);
        entry.setNewStatus(newStatus);
        entry.setRemarks(remarks);
        entry.setTimestamp(LocalDateTime.now());
        historyRepository.save(entry);
    }

    private void validateTransition(ComplaintStatus current, ComplaintStatus next) {
        EnumSet<ComplaintStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(
                current, EnumSet.noneOf(ComplaintStatus.class));

        if (!allowed.contains(next)) {
            throw new IllegalStateException(
                "Invalid status transition: cannot move from [" + current + "] to [" + next + "]. " +
                "Allowed transitions from " + current + ": " + allowed);
        }
    }

    // ----------------------------------------------------------------
    // LOCATION NORMALIZATION
    // ----------------------------------------------------------------
    private String normalizeLocation(String location) {
        if (location == null) return "";
        return location.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    // ----------------------------------------------------------------
    // ACTIVE DUPLICATE PRE-CHECK (for frontend real-time warning)
    // ----------------------------------------------------------------
    public java.util.Optional<Complaint> checkActiveDuplicate(String citizenId, String department, String category, String location) {
        java.util.List<ComplaintStatus> terminalStatuses = java.util.Arrays.asList(
                ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED
        );
        String normalizedLocation = normalizeLocation(location);
        return complaintRepository.findActiveDuplicate(citizenId, department, category, normalizedLocation, terminalStatuses);
    }
}
