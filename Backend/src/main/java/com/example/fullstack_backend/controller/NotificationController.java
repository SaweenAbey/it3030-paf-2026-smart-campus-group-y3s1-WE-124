package com.example.fullstack_backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstack_backend.dto.AudienceNotificationRequest;
import com.example.fullstack_backend.dto.BroadcastNotificationRequest;
import com.example.fullstack_backend.dto.CreateNotificationRequest;
import com.example.fullstack_backend.dto.NotificationResponse;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "false") Boolean unreadOnly) {
        String username = getCurrentUsername();
        logger.info("Fetching notifications for user: {} (unreadOnly={})", username, unreadOnly);
        return ResponseEntity.ok(notificationService.getMyNotifications(username, unreadOnly));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount() {
        String username = getCurrentUsername();
        long count = notificationService.getUnreadCount(username);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        String username = getCurrentUsername();
        logger.info("Marking notification {} as read for user {}", id, username);
        return ResponseEntity.ok(notificationService.markAsRead(id, username));
    }

    @PatchMapping("/me/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        String username = getCurrentUsername();
        int updated = notificationService.markAllAsRead(username);
        logger.info("Marked {} notifications as read for user {}", updated, username);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "updatedCount", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMyNotification(@PathVariable Long id) {
        String username = getCurrentUsername();
        notificationService.deleteMyNotification(id, username);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    @PostMapping("/user/{recipientUserId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<NotificationResponse> createNotificationForUser(
            @PathVariable Long recipientUserId,
            @Valid @RequestBody CreateNotificationRequest request) {
        String creator = getCurrentUsername();
        logger.info("Creating notification for user id {} by {}", recipientUserId, creator);
        return ResponseEntity.ok(notificationService.createForUser(recipientUserId, creator, request));
    }

    @PostMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createNotificationForRole(
            @PathVariable Role role,
            @Valid @RequestBody BroadcastNotificationRequest request) {
        String creator = getCurrentUsername();
        List<NotificationResponse> created = notificationService.createForRole(role, creator, request);

        return ResponseEntity.ok(Map.of(
                "message", "Role-based notifications created successfully",
                "role", role,
                "count", created.size(),
                "notifications", created
        ));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> broadcastToAllUsers(
            @Valid @RequestBody BroadcastNotificationRequest request) {
        String creator = getCurrentUsername();
        List<NotificationResponse> created = notificationService.createForAllUsers(creator, request);

        return ResponseEntity.ok(Map.of(
                "message", "Broadcast notifications created successfully",
                "count", created.size(),
                "notifications", created
        ));
    }

    @PostMapping("/audience")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> createNotificationByAudience(
            @Valid @RequestBody AudienceNotificationRequest request) {
        String creator = getCurrentUsername();
        logger.info("Creating notification by audience type {} by {}", request.getAudienceType(), creator);
        List<NotificationResponse> created = notificationService.createByAudience(creator, request);

        return ResponseEntity.ok(Map.of(
                "message", "Notifications created successfully for audience",
                "audienceType", request.getAudienceType(),
                "count", created.size(),
                "notifications", created
        ));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
