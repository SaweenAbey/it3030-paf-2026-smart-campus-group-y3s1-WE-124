package com.example.fullstack_backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.GoogleAuthRequest;
import com.example.fullstack_backend.dto.LoginRequest;
import com.example.fullstack_backend.dto.OtpVerificationRequest;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    private void setJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse httpResponse) {
        logger.info("=== Registration Request ===");
        logger.info("Username: {}", request.getUsername());
        logger.info("Email: {}", request.getEmail());
        logger.info("Role: {}", request.getRole());
        logger.info("Department: {}", request.getDepartment());
        
        try {
            AuthResponse response = userService.register(request);
            setJwtCookie(httpResponse, response.getToken());
            logger.info("Registration successful for user: {} (ID: {})", 
                       response.getUsername(), response.getUserId());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse httpResponse) {
        logger.info("=== Login Request ===");
        logger.info("Username: {}", request.getUsername());
        
        try {
            AuthResponse response = userService.login(request);
            setJwtCookie(httpResponse, response.getToken());
            logger.info("Password verified, login challenge processed for user: {}", response.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed for user: {} - {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request, HttpServletResponse httpResponse) {
        logger.info("=== OTP Verification Request ===");
        logger.info("Username: {}", request.getUsername());

        AuthResponse response = userService.verifyLoginOtp(request);
        setJwtCookie(httpResponse, response.getToken());
        logger.info("OTP verification successful for user: {}", response.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request, HttpServletResponse httpResponse) {
        logger.info("=== Google Authentication Request ===");
        AuthResponse response = userService.authenticateWithGoogle(request);
        setJwtCookie(httpResponse, response.getToken());
        logger.info("Google authentication successful for user: {}", response.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            logger.info("Token validation successful for user: {}", auth.getName());
            return ResponseEntity.ok("Token is valid");
        }
        logger.warn("Token validation failed");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is invalid");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            logger.warn("Attempt to get current user without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String username = auth.getName();
        logger.info("Fetching current user info: {}", username);
        UserResponse response = userService.getCurrentUser(username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        logger.info("User logged out, cookie cleared");
        return ResponseEntity.ok().build();
    }
}
