package com.civicpulse.grievance_service.repository;

import com.civicpulse.grievance_service.entity.Complaint;
import com.civicpulse.grievance_service.entity.Complaint.ComplaintStatus;
import com.civicpulse.grievance_service.entity.Complaint.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByCitizenId(String citizenId);
    List<Complaint> findByAssignedOfficer(String assignedOfficer);
    Page<Complaint> findByAssignedOfficer(String assignedOfficer, Pageable pageable);
    
    @Query("""
        SELECT c FROM Complaint c
        WHERE c.citizenId = :citizenId
        AND LOWER(TRIM(c.department)) = LOWER(TRIM(:department))
        AND LOWER(TRIM(c.category)) = LOWER(TRIM(:category))
        AND LOWER(TRIM(c.location)) = LOWER(TRIM(:location))
        AND c.status NOT IN :terminalStatuses
        ORDER BY c.createdAt DESC
    """)
    java.util.Optional<Complaint> findActiveDuplicate(
            @Param("citizenId") String citizenId,
            @Param("department") String department,
            @Param("category") String category,
            @Param("location") String location,
            @Param("terminalStatuses") List<ComplaintStatus> terminalStatuses);

    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findByStatusIn(List<ComplaintStatus> statuses);
    List<Complaint> findByDuplicateOf(UUID duplicateOf);

    List<Complaint> findByPriority(Priority priority);

    List<Complaint> findByDepartmentIgnoreCase(String department);
    Page<Complaint> findByDepartmentIgnoreCase(String department, Pageable pageable);

    @Query("""
        SELECT c FROM Complaint c
        WHERE LOWER(c.department) = LOWER(:dept)
           OR LOWER(c.department) LIKE LOWER(CONCAT('%', :deptKeyword, '%'))
           OR LOWER(c.assignedOfficer) = LOWER(:officerName)
           OR LOWER(c.assignedOfficer) = LOWER(:username)
        ORDER BY c.createdAt DESC
    """)
    Page<Complaint> findByDepartmentOrAssignedOfficer(
            @Param("dept") String dept,
            @Param("deptKeyword") String deptKeyword,
            @Param("officerName") String officerName,
            @Param("username") String username,
            Pageable pageable);

    List<Complaint> findByLocationContainingIgnoreCase(String locationKeyword);

    List<Complaint> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT c FROM Complaint c
        WHERE (:#{#status == null} = true OR c.status = :status)
        AND (:#{#priority == null} = true OR c.priority = :priority)
        AND (:#{#department == null} = true OR LOWER(c.department) = LOWER(:department))
        AND (:#{#ward == null} = true OR LOWER(c.location) LIKE LOWER(CONCAT('%', :ward, '%')))
    """)
    List<Complaint> searchComplaints(
            @Param("status") ComplaintStatus status,
            @Param("priority") Priority priority,
            @Param("department") String department,
            @Param("ward") String ward
    );
}