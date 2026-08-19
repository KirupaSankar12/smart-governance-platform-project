package com.civicpulse.citizen_service.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.civicpulse.citizen_service.dto.FamilyMemberDTO;
import com.civicpulse.citizen_service.entity.FamilyMember;
import com.civicpulse.citizen_service.repository.FamilyMemberRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/citizens/family")
public class FamilyMemberController {

    private final FamilyMemberRepository familyMemberRepository;

    public FamilyMemberController(FamilyMemberRepository familyMemberRepository) {
        this.familyMemberRepository = familyMemberRepository;
    }

    /**
     * GET /api/citizens/family?citizenId=...
     * Retrieve all family members / dependents for a citizen.
     */
    @GetMapping
    public ResponseEntity<List<FamilyMember>> getFamilyMembers(@RequestParam UUID citizenId) {
        return ResponseEntity.ok(familyMemberRepository.findByCitizenId(citizenId));
    }

    /**
     * POST /api/citizens/family
     * Add a new family member / dependent (Child, Spouse, Parent, Dependent).
     */
    @PostMapping
    public ResponseEntity<?> addFamilyMember(@Valid @RequestBody FamilyMemberDTO dto) {
        if (dto.citizenId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "citizenId is required"));
        }

        if (dto.aadhar != null && !dto.aadhar.isBlank()) {
            if (familyMemberRepository.existsByAadhar(dto.aadhar.trim())) {
                return ResponseEntity.badRequest().body(Map.of("message", "A family member with this Aadhaar number already exists."));
            }
        }

        FamilyMember member = new FamilyMember();
        member.citizenId = dto.citizenId;
        member.name = dto.name.trim();
        member.relationship = dto.relationship.trim();
        member.dateOfBirth = dto.dateOfBirth != null ? dto.dateOfBirth.trim() : null;
        member.gender = dto.gender != null ? dto.gender.trim() : null;
        member.aadhar = dto.aadhar != null && !dto.aadhar.isBlank() ? dto.aadhar.trim() : null;
        member.phoneNumber = dto.phoneNumber != null ? dto.phoneNumber.trim() : null;

        FamilyMember saved = familyMemberRepository.save(member);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/citizens/family/{memberId}
     * Remove a family member.
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<?> deleteFamilyMember(@PathVariable UUID memberId) {
        if (!familyMemberRepository.existsById(memberId)) {
            return ResponseEntity.notFound().build();
        }
        familyMemberRepository.deleteById(memberId);
        return ResponseEntity.ok(Map.of("message", "Family member removed successfully"));
    }
}
