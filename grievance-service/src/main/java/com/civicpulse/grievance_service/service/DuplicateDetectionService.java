package com.civicpulse.grievance_service.service;

import com.civicpulse.grievance_service.dto.DuplicateDetectionDTOs.*;
import com.civicpulse.grievance_service.entity.Complaint;
import com.civicpulse.grievance_service.entity.Complaint.ComplaintStatus;
import com.civicpulse.grievance_service.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DuplicateDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DuplicateDetectionService.class);

    @Value("${grievance.duplicate.threshold.high:0.85}")
    private double thresholdHigh;

    @Value("${grievance.duplicate.threshold.medium:0.70}")
    private double thresholdMedium;

    private final ComplaintRepository complaintRepository;
    private final EmbeddingService embeddingService;

    public DuplicateDetectionService(ComplaintRepository complaintRepository, EmbeddingService embeddingService) {
        this.complaintRepository = complaintRepository;
        this.embeddingService = embeddingService;
    }

    /**
     * Performs multi-factor duplicate detection for a incoming complaint request against active complaints.
     */
    public DuplicateCheckResponse detectDuplicates(DuplicateCheckRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            return new DuplicateCheckResponse(false, 0.0, "NONE", Collections.emptyList());
        }

        String newText = request.getTitle() + " " + (request.getDescription() != null ? request.getDescription() : "");
        float[] newVector = embeddingService.getEmbedding(newText);

        // Fetch candidate active complaints (exclude RESOLVED / CLOSED)
        List<ComplaintStatus> activeStatuses = Arrays.asList(
            ComplaintStatus.NEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.PENDING
        );

        List<Complaint> activeComplaints = complaintRepository.findByStatusIn(activeStatuses);
        if (activeComplaints.isEmpty()) {
            return new DuplicateCheckResponse(false, 0.0, "NONE", Collections.emptyList());
        }

        List<ComplaintMatchDto> matches = new ArrayList<>();

        for (Complaint candidate : activeComplaints) {
            // Ignore if candidate is itself a linked duplicate of another primary complaint
            if (candidate.getDuplicateOf() != null) {
                continue;
            }

            double semanticSim = computeSemanticSimilarity(newText, newVector, candidate);
            double categoryMatch = computeCategoryMatch(request.getCategory(), candidate.getCategory());
            double locationMatch = computeLocationMatch(request.getLocation(), request.getLatitude(), request.getLongitude(),
                                                      candidate.getLocation(), candidate.getLatitude(), candidate.getLongitude());
            double deptMatch = computeDepartmentMatch(request.getDepartment(), candidate.getDepartment());

            // Multi-factor formula: 50% semantic, 20% category, 20% location, 10% department
            double totalScore = (0.50 * semanticSim) + (0.20 * categoryMatch) + (0.20 * locationMatch) + (0.10 * deptMatch);

            log.debug("[DuplicateDetection] candidate={} semantic={} category={} location={} dept={} total={}",
                    candidate.getComplaintId(),
                    String.format("%.3f", semanticSim),
                    String.format("%.2f", categoryMatch),
                    String.format("%.2f", locationMatch),
                    String.format("%.2f", deptMatch),
                    String.format("%.3f", totalScore));

            if (totalScore >= thresholdMedium) {
                ComplaintMatchDto matchDto = new ComplaintMatchDto();
                matchDto.setComplaintId(candidate.getComplaintId());
                matchDto.setTitle(candidate.getTitle());
                matchDto.setDepartment(candidate.getDepartment());
                matchDto.setCategory(candidate.getCategory());
                matchDto.setLocation(candidate.getLocation());
                matchDto.setStatus(candidate.getStatus().name());
                matchDto.setCreatedAt(candidate.getCreatedAt());
                matchDto.setConfidence(totalScore);
                matchDto.setMatchType(totalScore >= thresholdHigh ? "HIGHLY_LIKELY" : "POSSIBLE");
                matchDto.setScoreBreakdown(new ScoreBreakdown(semanticSim, categoryMatch, locationMatch, deptMatch));

                matches.add(matchDto);
            }
        }

        // Sort candidates by confidence descending
        matches.sort((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()));

        if (matches.isEmpty()) {
            return new DuplicateCheckResponse(false, 0.0, "NONE", Collections.emptyList());
        }

        ComplaintMatchDto topMatch = matches.get(0);
        return new DuplicateCheckResponse(true, topMatch.getConfidence(), topMatch.getMatchType(), matches);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCORING UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    private double computeSemanticSimilarity(String newText, float[] newVector, Complaint candidate) {
        String candidateText = candidate.getTitle() + " " + (candidate.getDescription() != null ? candidate.getDescription() : "");

        if (candidate.getEmbeddingJson() != null && !candidate.getEmbeddingJson().isBlank()) {
            float[] candidateVector = embeddingService.fromJson(candidate.getEmbeddingJson());

            if (candidateVector.length > 0 && newVector.length > 0) {
                if (candidateVector.length != newVector.length) {
                    // Dimension mismatch: incoming vector (e.g. 3072-dim Gemini) vs stored vector
                    // (e.g. 128-dim LOCAL_NGRAM). Cross-space cosine is meaningless — fall through
                    // to text similarity which is model-agnostic.
                    log.warn("[DuplicateDetection] Dimension mismatch for candidate={}: "
                            + "newVector.dim={}, candidateVector.dim={} (embeddingModel='{}'). "
                            + "Using text similarity fallback. Consider re-embedding active complaints.",
                            candidate.getComplaintId(), newVector.length, candidateVector.length,
                            candidate.getEmbeddingModel());
                } else {
                    return embeddingService.calculateCosineSimilarity(newVector, candidateVector);
                }
            }
        }

        // Fallback: text-based Jaccard + N-gram similarity (model-agnostic)
        return embeddingService.calculateTextSimilarity(newText, candidateText);
    }

    private double computeCategoryMatch(String catA, String catB) {
        if (catA == null || catB == null || catA.isBlank() || catB.isBlank()) return 0.0;
        if (catA.equalsIgnoreCase(catB)) return 1.0;
        
        String a = catA.toLowerCase();
        String b = catB.toLowerCase();
        if (a.contains(b) || b.contains(a)) return 0.75;
        if (a.startsWith("other") || b.startsWith("other")) return 0.5;
        
        return 0.0;
    }

    private double computeLocationMatch(String locA, Double latA, Double lonA, String locB, Double latB, Double lonB) {
        // Geo-proximity if lat/long available
        if (latA != null && lonA != null && latB != null && lonB != null) {
            double distanceKm = haversineKm(latA, lonA, latB, lonB);
            if (distanceKm <= 0.2) return 1.0;
            if (distanceKm <= 0.5) return 0.9;
            if (distanceKm <= 1.0) return 0.7;
            if (distanceKm <= 2.0) return 0.4;
        }

        if (locA == null || locB == null || locA.isBlank() || locB.isBlank()) return 0.0;

        String a = locA.toLowerCase().trim();
        String b = locB.toLowerCase().trim();
        if (a.equals(b)) return 1.0;

        // Substring / landmark overlap
        String[] wordsA = a.split("\\s+");
        String[] wordsB = b.split("\\s+");
        int commonWords = 0;
        for (String w : wordsA) {
            if (w.length() > 3 && b.contains(w)) {
                commonWords++;
            }
        }

        if (commonWords >= 2) return 0.8;
        if (commonWords == 1) return 0.5;

        return 0.0;
    }

    private double computeDepartmentMatch(String deptA, String deptB) {
        if (deptA == null || deptB == null) return 0.0;
        return deptA.equalsIgnoreCase(deptB) ? 1.0 : 0.0;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
