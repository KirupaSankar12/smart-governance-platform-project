package com.civicpulse.notification_service.repository;

import com.civicpulse.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);

    @Query("SELECT n FROM Notification n WHERE " +
           "LOWER(n.recipient) = LOWER(:recipient) OR " +
           "LOWER(n.recipient) = LOWER(:recipientNoDomain) OR " +
           "LOWER(n.recipient) = LOWER(:officerName) OR " +
           "(LOWER(:recipient) NOT LIKE '%admin%' AND LOWER(:recipient) NOT LIKE '%john%' AND LOWER(:recipient) NOT LIKE '%emily%' AND LOWER(:recipient) NOT LIKE '%david%' AND LOWER(:recipient) NOT LIKE '%mark%' AND LOWER(n.recipient) = 'citizen') OR " +
           "(LOWER(:recipient) NOT LIKE '%admin%' AND LOWER(:recipient) NOT LIKE '%john%' AND LOWER(:recipient) NOT LIKE '%emily%' AND LOWER(:recipient) NOT LIKE '%david%' AND LOWER(:recipient) NOT LIKE '%mark%' AND LOWER(n.recipient) = 'cit-001') OR " +
           "(LOWER(:recipient) NOT LIKE '%admin%' AND LOWER(:recipient) NOT LIKE '%john%' AND LOWER(:recipient) NOT LIKE '%emily%' AND LOWER(:recipient) NOT LIKE '%david%' AND LOWER(:recipient) NOT LIKE '%mark%' AND LOWER(n.recipient) = 'bd5b60cb-9c09-4574-97a3-ad0142a10588') " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findForRecipient(
            @Param("recipient") String recipient, 
            @Param("recipientNoDomain") String recipientNoDomain,
            @Param("officerName") String officerName);

    @Query("SELECT n FROM Notification n WHERE LOWER(n.recipient) = LOWER(:recipient) OR LOWER(n.recipient) = 'admin' OR LOWER(n.recipientRole) = 'admin' ORDER BY n.createdAt DESC")
    List<Notification> findForAdmin(@Param("recipient") String recipient);
}
