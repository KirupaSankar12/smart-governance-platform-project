package com.civicpulse.citizen_service.entity;

import java.util.UUID;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "family_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public UUID memberId;

    @Column(nullable = false)
    public UUID citizenId; // Foreign key linking to parent / account owner Citizen ID

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    public String name;

    @NotBlank(message = "Relationship is required")
    @Column(nullable = false)
    public String relationship; // Child, Spouse, Parent, Other Dependent

    public String dateOfBirth;

    public String gender;

    @Column(unique = true)
    public String aadhar; // Optional Aadhaar for dependent

    public String phoneNumber; // Contact phone (optional)
}
