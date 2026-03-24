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
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String username;
    private String phoneNumber;
    private String address;
    private Integer age;
    private String campusId;
    private String department;
    private String specialization;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private LocalDateTime lastActivity;
    private String profileImageUrl;
}
