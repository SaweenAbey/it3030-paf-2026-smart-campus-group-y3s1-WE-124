package com.example.fullstack_backend.dto;

import com.example.fullstack_backend.model.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastNotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1200, message = "Message cannot exceed 1200 characters")
    private String message;

    private NotificationType type = NotificationType.INFO;

    @Size(max = 255, message = "Action URL cannot exceed 255 characters")
    private String actionUrl;
}
