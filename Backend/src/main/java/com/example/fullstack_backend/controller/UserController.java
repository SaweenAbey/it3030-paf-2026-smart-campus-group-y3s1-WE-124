package com.example.fullstack_backend.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    // Get current logged-in user profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("Fetching profile for user: {}", username);
        return ResponseEntity.ok(userService.getCurrentUser(username));
    }

    // Create new Admin or Technician account - Admin only
    @PostMapping("/create-admin-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createAdminUser(@Valid @RequestBody RegisterRequest request) {
        logger.info("Admin creating new user: {} with role: {}", request.getUsername(), request.getRole());
        AuthResponse response = userService.createAdminUser(request);
        return ResponseEntity.ok(response);
    }

    // Get all users - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        logger.info("Admin fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get users by role - Admin only
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable Role role) {
        logger.info("Admin fetching users by role: {}", role);
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Get active users - Admin only
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        logger.info("Admin fetching active users");
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    // Get pending tutor registration requests - Admin only
    @GetMapping("/pending-tutors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getPendingTutors() {
        logger.info("Admin fetching pending tutor registrations");
        List<UserResponse> pendingTutors = userService.getUsersByRole(Role.TEACHER)
                .stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingTutors);
    }

    // Approve tutor registration request - Admin only
    @PatchMapping("/approve-tutor/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> approveTutor(@PathVariable Long id) {
        logger.info("Admin approving tutor request for user id: {}", id);
        userService.updateActiveStatus(id, true);
        return ResponseEntity.ok(Map.of("message", "Tutor account approved successfully"));
    }

    // Update user by ID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #id)")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                    @Valid @RequestBody RegisterRequest request) {
        logger.info("Updating user with id: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Delete user - Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        logger.info("Admin deleting user with id: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Update user active status - Admin only
    @PatchMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateActiveStatus(@PathVariable Long id,
                                                                   @RequestParam Boolean isActive) {
        logger.info("Admin updating status for user id: {} to {}", id, isActive);
        userService.updateActiveStatus(id, isActive);
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    // Search users
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String keyword) {
        logger.info("Searching users with keyword: {}", keyword);
        return ResponseEntity.ok(userService.searchUsers(keyword));
    }

    // Update profile image - User can update their own image
    @PatchMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #id)")
    public ResponseEntity<UserResponse> updateProfileImage(@PathVariable Long id,
                                                            @RequestBody Map<String, String> request) {
        String imageUrl = request.get("profileImageUrl");
        logger.info("Updating profile image for user id: {}", id);
        return ResponseEntity.ok(userService.updateProfileImage(id, imageUrl));
    }

    // Delete profile image - User can delete their own image
    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #id)")
    public ResponseEntity<UserResponse> deleteProfileImage(@PathVariable Long id) {
        logger.info("Deleting profile image for user id: {}", id);
        return ResponseEntity.ok(userService.deleteProfileImage(id));
    }
}
