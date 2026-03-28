package com.example.fullstack_backend.dto;

import java.time.LocalDateTime;

import com.example.fullstack_backend.model.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long recipientId;
    private String recipientUsername;
    private String recipientName;

    private Long createdById;
    private String createdByUsername;
}
