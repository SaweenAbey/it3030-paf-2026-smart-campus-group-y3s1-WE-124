package com.example.fullstack_backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.service.UserService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Admin Dashboard",
                "role", "ADMIN",
                "access", "Full administrative access"
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "message", "Admin statistics",
                "info", "You have access to all system statistics"
        ));
    }

    // Create Manager Account - Admin only
    @PostMapping("/create-manager")
    public ResponseEntity<AuthResponse> createManagerAccount(@Valid @RequestBody RegisterRequest request) {
        logger.info("Admin creating new Manager account: {} with department: {}", request.getUsername(), request.getDepartment());
        request.setRole(Role.MANAGER);
        AuthResponse response = userService.createAdminUser(request);
        logger.info("Manager account created successfully for: {}", request.getUsername());
        return ResponseEntity.ok(response);
    }

    // Get all Managers - Admin only
    @GetMapping("/managers")
    public ResponseEntity<List<UserResponse>> getAllManagers() {
        logger.info("Admin fetching all Manager accounts");
        return ResponseEntity.ok(userService.getUsersByRole(Role.MANAGER));
    }

    // Update Manager status - Admin only
    @PatchMapping("/manager/{id}/status")
    public ResponseEntity<Map<String, String>> updateManagerStatus(@PathVariable Long id, @RequestParam Boolean isActive) {
        logger.info("Admin updating Manager status for id: {} to {}", id, isActive);
        userService.updateActiveStatus(id, isActive);
        return ResponseEntity.ok(Map.of("message", "Manager status updated successfully"));
    }

    // Delete Manager account - Admin only
    @DeleteMapping("/manager/{id}")
    public ResponseEntity<Map<String, String>> deleteManager(@PathVariable Long id) {
        logger.info("Admin deleting Manager account with id: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Manager account deleted successfully"));
    }
}
