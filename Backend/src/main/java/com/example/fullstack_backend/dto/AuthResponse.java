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
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String phoneNumber;
    private String department;
    private String campusId;
    private Role role;
    private Boolean isEmailVerified;
    private String profileImageUrl;
    private LocalDateTime expiresAt;
    private LocalDateTime lastLogin;
    private Boolean otpRequired;
    private String message;
}
