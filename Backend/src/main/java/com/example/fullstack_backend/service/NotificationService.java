package com.example.fullstack_backend.service;

import java.util.List;

import com.example.fullstack_backend.dto.BroadcastNotificationRequest;
import com.example.fullstack_backend.dto.CreateNotificationRequest;
import com.example.fullstack_backend.dto.NotificationResponse;
import com.example.fullstack_backend.model.Role;

public interface NotificationService {

    NotificationResponse createForUser(Long recipientUserId, String creatorUsername, CreateNotificationRequest request);

    List<NotificationResponse> createForRole(Role role, String creatorUsername, BroadcastNotificationRequest request);

    List<NotificationResponse> createForAllUsers(String creatorUsername, BroadcastNotificationRequest request);

    List<NotificationResponse> getMyNotifications(String username, Boolean unreadOnly);

    long getUnreadCount(String username);

    NotificationResponse markAsRead(Long notificationId, String username);

    int markAllAsRead(String username);

    void deleteMyNotification(Long notificationId, String username);
}
