package com.example.fullstack_backend.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fullstack_backend.dto.AuthResponse;
import com.example.fullstack_backend.dto.GoogleAuthRequest;
import com.example.fullstack_backend.dto.LoginRequest;
import com.example.fullstack_backend.dto.OtpVerificationRequest;
import com.example.fullstack_backend.dto.RegisterRequest;
import com.example.fullstack_backend.dto.UserResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.exception.UserAlreadyExistsException;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.security.JwtUtil;
import com.example.fullstack_backend.service.GoogleTokenVerifierService;
import com.example.fullstack_backend.service.SmsOtpService;
import com.example.fullstack_backend.service.UserService;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 5;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmsOtpService smsOtpService;

    @Autowired
    private GoogleTokenVerifierService googleTokenVerifierService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user: {} with email: {}", request.getUsername(), request.getEmail());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Registration failed: Username already exists: {}", request.getUsername());
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            logger.warn("Registration failed: Password mismatch for user: {}", request.getUsername());
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .age(request.getAge())
                .campusId(request.getCampusId())
                .department(request.getDepartment())
                .specialization(request.getSpecialization())
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .profileImageUrl(request.getProfileImageUrl())
                .isActive(true)
                .isEmailVerified(false)
                .loginAttempts(0)
                .build();

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {} (ID: {}, Role: {})", 
                    savedUser.getUsername(), savedUser.getId(), savedUser.getRole());

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .department(savedUser.getDepartment())
                .campusId(savedUser.getCampusId())
                .role(savedUser.getRole())
                .isEmailVerified(savedUser.getIsEmailVerified())
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
            User user = (User) authentication.getPrincipal();

                if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
                logger.warn("Login blocked. No phone number configured for user: {}", user.getUsername());
                throw new IllegalArgumentException("Phone number is not configured for this account");
                }

                String otpCode = generateOtpCode();
                LocalDateTime now = LocalDateTime.now();

                user.setLoginOtp(otpCode);
                user.setLoginOtpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
                user.setLastOtpRequestedAt(now);
                user.setLastActivity(now);
            userRepository.save(user);

                try {
                    smsOtpService.sendLoginOtp(user.getUsername(), user.getPhoneNumber(), otpCode);
                } catch (IllegalStateException ex) {
                    logger.error("OTP delivery failed for user {}: {}", user.getUsername(), ex.getMessage());
                    throw new IllegalArgumentException(ex.getMessage());
                }

                logger.info("Primary credentials verified. OTP challenge created for user: {}", user.getUsername());

            return AuthResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .department(user.getDepartment())
                    .campusId(user.getCampusId())
                    .role(user.getRole())
                    .isEmailVerified(user.getIsEmailVerified())
                    .profileImageUrl(user.getProfileImageUrl())
                    .otpRequired(true)
                    .message("OTP sent to your registered phone number")
                    .build();

        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials for user: {}", request.getUsername());
            
           
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setLoginAttempts(user.getLoginAttempts() + 1);
                
              
                if (user.getLoginAttempts() >= 5) {
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                    logger.warn("Account locked due to multiple failed login attempts: {}", 
                               user.getUsername());
                }
                userRepository.save(user);
            }
            
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Override
    public AuthResponse verifyLoginOtp(OtpVerificationRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or OTP"));

        if (user.getLoginOtp() == null || user.getLoginOtpExpiresAt() == null) {
            logger.warn("OTP verification failed. No OTP challenge for user: {}", request.getUsername());
            throw new BadCredentialsException("No OTP request found. Please login again");
        }

        if (user.getLoginOtpExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warn("OTP verification failed. OTP expired for user: {}", request.getUsername());
            clearOtpState(user);
            userRepository.save(user);
            throw new BadCredentialsException("OTP expired. Please login again");
        }

        if (!user.getLoginOtp().equals(request.getOtp())) {
            logger.warn("OTP verification failed. Invalid OTP for user: {}", request.getUsername());
            throw new BadCredentialsException("Invalid OTP");
        }

        clearOtpState(user);
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        user.setLastActivity(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        logger.info("OTP verified. Login completed for user: {}", user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .campusId(user.getCampusId())
                .role(user.getRole())
                .isEmailVerified(user.getIsEmailVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .expiresAt(jwtUtil.getExpirationDateTime(token))
                .lastLogin(user.getLastLogin())
                .otpRequired(false)
                .message("Login successful")
                .build();
    }

    @Override
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifierService.verify(request.getIdToken());

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email is missing");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createGoogleUser(payload));

        user.setIsEmailVerified(true);
        user.setLastLogin(LocalDateTime.now());
        user.setLastActivity(LocalDateTime.now());
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .department(savedUser.getDepartment())
                .campusId(savedUser.getCampusId())
                .role(savedUser.getRole())
                .isEmailVerified(savedUser.getIsEmailVerified())
                .profileImageUrl(savedUser.getProfileImageUrl())
                .expiresAt(jwtUtil.getExpirationDateTime(token))
                .lastLogin(savedUser.getLastLogin())
                .otpRequired(false)
                .message("Google authentication successful")
                .build();
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

        logger.info("Updating user: {}", user.getUsername());

        
        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Update failed: Username already taken: {}", request.getUsername());
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

       
        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Update failed: Email already taken: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

    
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setAge(request.getAge());
        
      
        user.setCampusId(request.getCampusId());
        user.setDepartment(request.getDepartment());
        user.setSpecialization(request.getSpecialization());
        
     
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

  
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                logger.warn("Update failed: Password mismatch for user: {}", user.getUsername());
                throw new IllegalArgumentException("Password and confirm password do not match");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {} (Role: {})", updatedUser.getUsername(), updatedUser.getRole());

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
                .email(user.getEmail())
                .username(user.getUsername())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .age(user.getAge())
                .campusId(user.getCampusId())
                .department(user.getDepartment())
                .specialization(user.getSpecialization())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .lastActivity(user.getLastActivity())
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

    private String generateOtpCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private User createGoogleUser(GoogleIdToken.Payload payload) {
        String email = payload.getEmail();
        String name = payload.get("name") != null ? payload.get("name").toString() : "Google User";
        String picture = payload.get("picture") != null ? payload.get("picture").toString() : null;

        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (baseUsername.isBlank()) {
            baseUsername = "user";
        }
        String username = generateUniqueUsername(baseUsername);

        return User.builder()
                .name(name)
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(Role.STUDENT)
                .isActive(true)
                .isEmailVerified(true)
                .profileImageUrl(picture)
                .loginAttempts(0)
                .build();
    }

    private String generateUniqueUsername(String baseUsername) {
        String candidate = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + counter;
            counter++;
        }
        return candidate;
    }

    private void clearOtpState(User user) {
        user.setLoginOtp(null);
        user.setLoginOtpExpiresAt(null);
    }

}
