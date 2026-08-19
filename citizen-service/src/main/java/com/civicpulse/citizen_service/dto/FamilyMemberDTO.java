package com.civicpulse.citizen_service.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FamilyMemberDTO {
    public UUID memberId;
    public UUID citizenId;

    @NotBlank(message = "Name is required")
    public String name;

    @NotBlank(message = "Relationship is required")
    public String relationship; // Child, Spouse, Parent, Other Dependent

    public String dateOfBirth;
    public String gender;
    public String aadhar;
    public String phoneNumber;
}
