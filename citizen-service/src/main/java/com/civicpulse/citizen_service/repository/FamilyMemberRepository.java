package com.civicpulse.citizen_service.repository;

import com.civicpulse.citizen_service.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
    List<FamilyMember> findByCitizenId(UUID citizenId);
    boolean existsByAadhar(String aadhar);
}
