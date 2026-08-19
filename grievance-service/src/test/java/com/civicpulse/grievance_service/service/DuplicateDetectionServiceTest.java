package com.civicpulse.grievance_service.service;

import com.civicpulse.grievance_service.dto.DuplicateDetectionDTOs.*;
import com.civicpulse.grievance_service.entity.Complaint;
import com.civicpulse.grievance_service.entity.Complaint.ComplaintStatus;
import com.civicpulse.grievance_service.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DuplicateDetectionServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private EmbeddingService embeddingService;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    private Complaint activeWaterComplaint;
    private Complaint resolvedComplaint;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(duplicateDetectionService, "thresholdHigh", 0.85);
        ReflectionTestUtils.setField(duplicateDetectionService, "thresholdMedium", 0.70);

        activeWaterComplaint = new Complaint();
        activeWaterComplaint.setComplaintId(UUID.randomUUID());
        activeWaterComplaint.setTitle("Water leakage on Main Street");
        activeWaterComplaint.setDescription("Main pipeline is leaking heavily near Sector 4 junction");
        activeWaterComplaint.setDepartment("Water Department");
        activeWaterComplaint.setCategory("Water Leakage");
        activeWaterComplaint.setLocation("Main Street, Sector 4");
        activeWaterComplaint.setStatus(ComplaintStatus.IN_PROGRESS);
        activeWaterComplaint.setCreatedAt(LocalDateTime.now().minusHours(2));

        resolvedComplaint = new Complaint();
        resolvedComplaint.setComplaintId(UUID.randomUUID());
        resolvedComplaint.setTitle("Water leakage on Main Street");
        resolvedComplaint.setDescription("Fixed pipeline leak");
        resolvedComplaint.setDepartment("Water Department");
        resolvedComplaint.setCategory("Water Leakage");
        resolvedComplaint.setLocation("Main Street, Sector 4");
        resolvedComplaint.setStatus(ComplaintStatus.RESOLVED);
    }

    @Test
    void testExactDuplicateDetectedAsHighlyLikely() {
        when(complaintRepository.findByStatusIn(anyList())).thenReturn(Collections.singletonList(activeWaterComplaint));
        when(embeddingService.getEmbedding(any())).thenReturn(new float[]{0.1f, 0.2f, 0.3f});
        when(embeddingService.calculateTextSimilarity(any(), any())).thenReturn(0.95);

        DuplicateCheckRequest request = new DuplicateCheckRequest();
        request.setTitle("Water leakage on Main Street");
        request.setDescription("Main pipeline is leaking heavily near Sector 4 junction");
        request.setDepartment("Water Department");
        request.setCategory("Water Leakage");
        request.setLocation("Main Street, Sector 4");

        DuplicateCheckResponse response = duplicateDetectionService.detectDuplicates(request);

        assertTrue(response.isDuplicate());
        assertEquals("HIGHLY_LIKELY", response.getMatchType());
        assertTrue(response.getConfidence() >= 0.85);
        assertFalse(response.getMatches().isEmpty());
    }

    @Test
    void testSemanticallySimilarPhrasingDetected() {
        when(complaintRepository.findByStatusIn(anyList())).thenReturn(Collections.singletonList(activeWaterComplaint));
        when(embeddingService.getEmbedding(any())).thenReturn(new float[]{0.1f, 0.2f, 0.3f});
        when(embeddingService.calculateTextSimilarity(any(), any())).thenReturn(0.82);

        DuplicateCheckRequest request = new DuplicateCheckRequest();
        request.setTitle("Main Street water pipeline is leaking");
        request.setDescription("There is a huge pipe leakage near Main Road Sector 4");
        request.setDepartment("Water Department");
        request.setCategory("Water Leakage");
        request.setLocation("Main Street");

        DuplicateCheckResponse response = duplicateDetectionService.detectDuplicates(request);

        assertTrue(response.isDuplicate());
        assertTrue(response.getConfidence() >= 0.70);
    }

    @Test
    void testResolvedComplaintsExcludedFromDuplicateCheck() {
        when(complaintRepository.findByStatusIn(anyList())).thenReturn(Collections.emptyList());

        DuplicateCheckRequest request = new DuplicateCheckRequest();
        request.setTitle("Water leakage on Main Street");
        request.setDepartment("Water Department");
        request.setLocation("Main Street, Sector 4");

        DuplicateCheckResponse response = duplicateDetectionService.detectDuplicates(request);

        assertFalse(response.isDuplicate());
        assertEquals(0, response.getMatches().size());
    }

    @Test
    void testDifferentDepartmentDoesNotTriggerHighDuplicate() {
        when(complaintRepository.findByStatusIn(anyList())).thenReturn(Collections.singletonList(activeWaterComplaint));
        when(embeddingService.getEmbedding(any())).thenReturn(new float[]{0.1f, 0.2f, 0.3f});
        when(embeddingService.calculateTextSimilarity(any(), any())).thenReturn(0.30);

        DuplicateCheckRequest request = new DuplicateCheckRequest();
        request.setTitle("Street Light Not Working");
        request.setDescription("Dark near sector 4 street");
        request.setDepartment("Electricity Department");
        request.setCategory("Street Light Issue");
        request.setLocation("Main Street, Sector 4");

        DuplicateCheckResponse response = duplicateDetectionService.detectDuplicates(request);

        assertFalse(response.isDuplicate());
        assertEquals("NONE", response.getMatchType());
    }
}
