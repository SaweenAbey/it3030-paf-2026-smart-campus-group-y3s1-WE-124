package com.example.fullstack_backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fullstack_backend.dto.BroadcastNotificationRequest;
import com.example.fullstack_backend.dto.CreateNotificationRequest;
import com.example.fullstack_backend.dto.NotificationResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.model.Notification;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.NotificationRepository;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public NotificationResponse createForUser(Long recipientUserId, String creatorUsername, CreateNotificationRequest request) {
        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found with id: " + recipientUserId));

        User createdBy = getCreatorIfPresent(creatorUsername);

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType() == null ? com.example.fullstack_backend.model.NotificationType.INFO : request.getType())
                .actionUrl(request.getActionUrl())
                .recipient(recipient)
                .createdBy(createdBy)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        logger.info("Notification created for user: {} by {}", recipient.getUsername(), creatorUsername);
        return mapToResponse(saved);
    }

    @Override
    public List<NotificationResponse> createForRole(Role role, String creatorUsername, BroadcastNotificationRequest request) {
        List<User> recipients = userRepository.findByRoleAndIsActive(role, true);
        if (recipients.isEmpty()) {
            throw new ResourceNotFoundException("No active users found for role: " + role);
        }

        User createdBy = getCreatorIfPresent(creatorUsername);

        List<Notification> notifications = recipients.stream()
                .map(user -> Notification.builder()
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(request.getType() == null ? com.example.fullstack_backend.model.NotificationType.INFO : request.getType())
                        .actionUrl(request.getActionUrl())
                        .recipient(user)
                        .createdBy(createdBy)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        List<Notification> saved = notificationRepository.saveAll(notifications);
        logger.info("Broadcast notification created for role {} with {} recipients by {}", role, saved.size(), creatorUsername);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> createForAllUsers(String creatorUsername, BroadcastNotificationRequest request) {
        List<User> recipients = userRepository.findByIsActive(true);
        if (recipients.isEmpty()) {
            throw new ResourceNotFoundException("No active users found in the system");
        }

        User createdBy = getCreatorIfPresent(creatorUsername);

        List<Notification> notifications = recipients.stream()
                .map(user -> Notification.builder()
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(request.getType() == null ? com.example.fullstack_backend.model.NotificationType.INFO : request.getType())
                        .actionUrl(request.getActionUrl())
                        .recipient(user)
                        .createdBy(createdBy)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        List<Notification> saved = notificationRepository.saveAll(notifications);
        logger.info("Broadcast notification created for all users. Count: {} by {}", saved.size(), creatorUsername);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String username, Boolean unreadOnly) {
        List<Notification> notifications = Boolean.TRUE.equals(unreadOnly)
                ? notificationRepository.findByRecipientUsernameAndIsReadOrderByCreatedAtDesc(username, false)
                : notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);

        return notifications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndIsRead(username, false);
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getUsername().equals(username)) {
            throw new IllegalArgumentException("You are not allowed to modify this notification");
        }

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    @Override
    public int markAllAsRead(String username) {
        return notificationRepository.markAllAsReadByUsername(username);
    }

    @Override
    public void deleteMyNotification(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getUsername().equals(username)) {
            throw new IllegalArgumentException("You are not allowed to delete this notification");
        }

        notificationRepository.delete(notification);
        logger.info("Notification {} deleted by recipient {}", notificationId, username);
    }

    private User getCreatorIfPresent(String creatorUsername) {
        if (creatorUsername == null || creatorUsername.isBlank()) {
            return null;
        }

        return userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Creator user not found: " + creatorUsername));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        User createdBy = notification.getCreatedBy();
        User recipient = notification.getRecipient();

        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .actionUrl(notification.getActionUrl())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .recipientId(recipient.getId())
                .recipientUsername(recipient.getUsername())
                .recipientName(recipient.getName())
                .createdById(createdBy != null ? createdBy.getId() : null)
                .createdByUsername(createdBy != null ? createdBy.getUsername() : null)
                .build();
    }
}
