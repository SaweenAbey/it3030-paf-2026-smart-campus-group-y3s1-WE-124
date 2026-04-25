package com.example.fullstack_backend.dto;

import com.example.fullstack_backend.model.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @jakarta.validation.constraints.Pattern(
        regexp = "^it\\d+@my\\.sliit\\.lk$",
        message = "Email must be a valid IT number format (e.g., it23748330@my.sliit.lk)"
    )
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @jakarta.validation.constraints.Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @jakarta.validation.constraints.Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must be exactly 10 digits"
    )
    private String phoneNumber;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age must be less than 150")
    private Integer age;

    @Size(max = 20, message = "Campus ID cannot exceed 20 characters")
    private String campusId;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Specialization cannot exceed 100 characters")
    private String specialization;

    private Role role = Role.STUDENT;

    @Size(max = 500, message = "Profile image URL cannot exceed 500 characters")
    private String profileImageUrl;
}
