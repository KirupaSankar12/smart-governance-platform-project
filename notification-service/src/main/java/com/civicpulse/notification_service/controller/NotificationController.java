package com.civicpulse.notification_service.controller;

import com.civicpulse.notification_service.entity.Notification;
import com.civicpulse.notification_service.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/recipient/{recipient}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String recipient) {
        try {
            if (recipient == null || recipient.isBlank()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            String cleanRecipient = recipient.trim().toLowerCase();
            String recipientNoDomain = cleanRecipient.contains("@") ? cleanRecipient.split("@")[0] : cleanRecipient;

            String officerName = "";
            if (cleanRecipient.contains("health")) officerName = "john";
            else if (cleanRecipient.contains("revenue")) officerName = "mark";
            else if (cleanRecipient.contains("municipal")) officerName = "ryan";
            else if (cleanRecipient.contains("water")) officerName = "chris";
            else if (cleanRecipient.contains("roads")) officerName = "ethan";
            else if (cleanRecipient.contains("electricity")) officerName = "jack";
            else if (cleanRecipient.contains("socialwelfare") || cleanRecipient.contains("welfare")) officerName = "david";
            else if (cleanRecipient.contains("urban")) officerName = "will";
            else if (cleanRecipient.contains("education")) officerName = "emily";
            else if (cleanRecipient.contains("sanitation")) officerName = "sam";

            List<Notification> list;
            if (cleanRecipient.contains("admin")) {
                list = notificationRepository.findForAdmin(cleanRecipient);
            } else {
                list = notificationRepository.findForRecipient(cleanRecipient, recipientNoDomain, officerName);
            }
            return ResponseEntity.ok(list != null ? list : Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody java.util.Map<String, Object> body) {
        try {
            String recipient = body.containsKey("recipient") && body.get("recipient") != null ? String.valueOf(body.get("recipient")) : "citizen";
            String title = body.containsKey("title") && body.get("title") != null ? String.valueOf(body.get("title")) : "Notification";
            String message = body.containsKey("message") && body.get("message") != null ? String.valueOf(body.get("message")) : "";
            String eventType = body.containsKey("eventType") && body.get("eventType") != null ? String.valueOf(body.get("eventType")) : "GENERAL";
            String recipientRole = body.containsKey("recipientRole") && body.get("recipientRole") != null ? String.valueOf(body.get("recipientRole")) : "CITIZEN";
            
            String relatedEntityId = null;
            if (body.containsKey("relatedEntityId") && body.get("relatedEntityId") != null) {
                relatedEntityId = String.valueOf(body.get("relatedEntityId"));
            } else if (body.containsKey("referenceId") && body.get("referenceId") != null) {
                relatedEntityId = String.valueOf(body.get("referenceId"));
            }

            String relatedEntityType = null;
            if (body.containsKey("relatedEntityType") && body.get("relatedEntityType") != null) {
                relatedEntityType = String.valueOf(body.get("relatedEntityType"));
            } else if (body.containsKey("referenceType") && body.get("referenceType") != null) {
                relatedEntityType = String.valueOf(body.get("referenceType"));
            }

            Notification notification = new Notification(
                recipient,
                eventType,
                title,
                message,
                relatedEntityId,
                relatedEntityType,
                false,
                recipientRole,
                java.time.LocalDateTime.now()
            );

            Notification saved = notificationRepository.save(notification);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setReadStatus(true);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
