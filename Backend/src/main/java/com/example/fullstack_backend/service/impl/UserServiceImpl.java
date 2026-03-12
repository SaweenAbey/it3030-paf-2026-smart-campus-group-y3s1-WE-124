package com.example.fullstack_backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.LoginRequest;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.exception.UserAlreadyExistsException;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.security.JwtUtil;
import com.example.fullstack_backend.service.UserService;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user: {}", request.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .address(request.getAddress())
                .age(request.getAge())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .profileImageUrl(request.getProfileImageUrl())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getUsername());

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .name(savedUser.getName())
                .role(savedUser.getRole())
                .profileImageUrl(savedUser.getProfileImageUrl())
                .expiresAt(jwtUtil.getExpirationDateTime(token))
                .message("User registered successfully")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        logger.info("User login attempt: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();

            // Update last login time
            userRepository.updateLastLogin(user.getUsername(), LocalDateTime.now());

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            logger.info("User logged in successfully: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .role(user.getRole())
                    .profileImageUrl(user.getProfileImageUrl())
                    .expiresAt(jwtUtil.getExpirationDateTime(token))
                    .message("Login successful")
                    .build();

        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials for user: {}", request.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByIsActive(true).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Check if new username is taken by another user
        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        user.setName(request.getName());
        user.setAddress(request.getAddress());
        user.setAge(request.getAge());
        user.setUsername(request.getUsername());
        
        // Update profile image URL if provided
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        // Update password only if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Password and confirm password do not match");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {}", updatedUser.getUsername());

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        userRepository.delete(user);
        logger.info("User deleted successfully: {}", user.getUsername());
    }

    @Override
    public void updateActiveStatus(Long id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        userRepository.updateActiveStatus(id, isActive);
        logger.info("User {} status updated to: {}", user.getUsername(), isActive);
    }

    @Override
    public List<UserResponse> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .address(user.getAddress())
                .age(user.getAge())
                .username(user.getUsername())
                .isActive(user.getIsActive())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Override
    public UserResponse updateProfileImage(Long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setProfileImageUrl(imageUrl);
        User updatedUser = userRepository.save(user);
        logger.info("Profile image updated for user: {}", updatedUser.getUsername());
        
        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse deleteProfileImage(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setProfileImageUrl(null);
        User updatedUser = userRepository.save(user);
        logger.info("Profile image deleted for user: {}", updatedUser.getUsername());
        
        return mapToUserResponse(updatedUser);
    }
}
