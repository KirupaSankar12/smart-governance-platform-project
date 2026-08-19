package com.civicpulse.grievance_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class DuplicateDetectionDTOs {

    public static class DuplicateCheckRequest {
        private String title;
        private String description;
        private String department;
        private String category;
        private String location;
        private Double latitude;
        private Double longitude;

        public DuplicateCheckRequest() {}

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getDepartment() { return department; }
        public String getCategory() { return category; }
        public String getLocation() { return location; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }

        public void setTitle(String title) { this.title = title; }
        public void setDescription(String description) { this.description = description; }
        public void setDepartment(String department) { this.department = department; }
        public void setCategory(String category) { this.category = category; }
        public void setLocation(String location) { this.location = location; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class ScoreBreakdown {
        private double semanticSimilarity;
        private double categoryMatch;
        private double locationMatch;
        private double departmentMatch;

        public ScoreBreakdown() {}
        public ScoreBreakdown(double semanticSimilarity, double categoryMatch, double locationMatch, double departmentMatch) {
            this.semanticSimilarity = Math.round(semanticSimilarity * 100.0) / 100.0;
            this.categoryMatch = Math.round(categoryMatch * 100.0) / 100.0;
            this.locationMatch = Math.round(locationMatch * 100.0) / 100.0;
            this.departmentMatch = Math.round(departmentMatch * 100.0) / 100.0;
        }

        public double getSemanticSimilarity() { return semanticSimilarity; }
        public double getCategoryMatch() { return categoryMatch; }
        public double getLocationMatch() { return locationMatch; }
        public double getDepartmentMatch() { return departmentMatch; }

        public void setSemanticSimilarity(double s) { this.semanticSimilarity = s; }
        public void setCategoryMatch(double c) { this.categoryMatch = c; }
        public void setLocationMatch(double l) { this.locationMatch = l; }
        public void setDepartmentMatch(double d) { this.departmentMatch = d; }
    }

    public static class ComplaintMatchDto {
        private UUID complaintId;
        private String title;
        private String department;
        private String category;
        private String location;
        private String status;
        private LocalDateTime createdAt;
        private double confidence;
        private String matchType; // HIGHLY_LIKELY | POSSIBLE
        private ScoreBreakdown scoreBreakdown;

        public ComplaintMatchDto() {}

        public UUID getComplaintId() { return complaintId; }
        public String getTitle() { return title; }
        public String getDepartment() { return department; }
        public String getCategory() { return category; }
        public String getLocation() { return location; }
        public String getStatus() { return status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public double getConfidence() { return confidence; }
        public String getMatchType() { return matchType; }
        public ScoreBreakdown getScoreBreakdown() { return scoreBreakdown; }

        public void setComplaintId(UUID complaintId) { this.complaintId = complaintId; }
        public void setTitle(String title) { this.title = title; }
        public void setDepartment(String department) { this.department = department; }
        public void setCategory(String category) { this.category = category; }
        public void setLocation(String location) { this.location = location; }
        public void setStatus(String status) { this.status = status; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public void setConfidence(double confidence) { this.confidence = Math.round(confidence * 100.0) / 100.0; }
        public void setMatchType(String matchType) { this.matchType = matchType; }
        public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }
    }

    public static class DuplicateCheckResponse {
        private boolean isDuplicate;
        private double confidence;
        private String matchType;
        private List<ComplaintMatchDto> matches;

        public DuplicateCheckResponse() {}
        public DuplicateCheckResponse(boolean isDuplicate, double confidence, String matchType, List<ComplaintMatchDto> matches) {
            this.isDuplicate = isDuplicate;
            this.confidence = Math.round(confidence * 100.0) / 100.0;
            this.matchType = matchType;
            this.matches = matches;
        }

        public boolean isDuplicate() { return isDuplicate; }
        public double getConfidence() { return confidence; }
        public String getMatchType() { return matchType; }
        public List<ComplaintMatchDto> getMatches() { return matches; }

        public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
        public void setMatchType(String matchType) { this.matchType = matchType; }
        public void setMatches(List<ComplaintMatchDto> matches) { this.matches = matches; }
    }

    public static class LinkComplaintRequest {
        private UUID primaryComplaintId;
        private String citizenId;
        private String title;
        private String description;
        private String department;
        private String category;
        private String location;
        private String remarks;

        public LinkComplaintRequest() {}

        public UUID getPrimaryComplaintId() { return primaryComplaintId; }
        public String getCitizenId() { return citizenId; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getDepartment() { return department; }
        public String getCategory() { return category; }
        public String getLocation() { return location; }
        public String getRemarks() { return remarks; }

        public void setPrimaryComplaintId(UUID primaryComplaintId) { this.primaryComplaintId = primaryComplaintId; }
        public void setCitizenId(String citizenId) { this.citizenId = citizenId; }
        public void setTitle(String title) { this.title = title; }
        public void setDescription(String description) { this.description = description; }
        public void setDepartment(String department) { this.department = department; }
        public void setCategory(String category) { this.category = category; }
        public void setLocation(String location) { this.location = location; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
