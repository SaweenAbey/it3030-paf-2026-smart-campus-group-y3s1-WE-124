package com.example.fullstack_backend.dto;

import java.time.LocalDateTime;

import com.example.fullstack_backend.model.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userName;
    private Role userRole;
    private String userProfileImageUrl;

    private Integer rating;
    private String title;
    private String comment;
    private String supportTopic;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
