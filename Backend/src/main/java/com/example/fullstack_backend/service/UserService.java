package com.example.fullstack_backend.service;

import java.util.List;
import java.util.Optional;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.GoogleAuthRequest;
import com.example.fullstack_backend.dto.LoginRequest;
import com.example.fullstack_backend.dto.OtpVerificationRequest;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;

public interface UserService {

    AuthResponse register(RegisterRequest request);
    
    AuthResponse createAdminUser(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse verifyLoginOtp(OtpVerificationRequest request);

    AuthResponse authenticateWithGoogle(GoogleAuthRequest request);

    Optional<User> findByUsername(String username);

    Optional<User> findById(Long id);

    List<UserResponse> getAllUsers();

    List<UserResponse> getUsersByRole(Role role);

    List<UserResponse> getActiveUsers();

    UserResponse updateUser(Long id, RegisterRequest request);

    void deleteUser(Long id);

    void updateActiveStatus(Long id, Boolean isActive);

    List<UserResponse> searchUsers(String keyword);

    UserResponse getCurrentUser(String username);

    UserResponse updateProfileImage(Long id, String imageUrl);

    UserResponse deleteProfileImage(Long id);
}
