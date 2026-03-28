package com.example.fullstack_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.fullstack_backend.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String username);

    List<Notification> findByRecipientUsernameAndIsReadOrderByCreatedAtDesc(String username, Boolean isRead);

    long countByRecipientUsernameAndIsRead(String username, Boolean isRead);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.recipient.username = :username AND n.isRead = false")
    int markAllAsReadByUsername(@Param("username") String username);
}
