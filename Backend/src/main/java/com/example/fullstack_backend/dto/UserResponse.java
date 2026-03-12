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
    private String address;
    private Integer age;
    private String username;
    private Boolean isActive;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private String profileImageUrl;
}
