package com.example.fullstack_backend.dto;

import java.time.LocalTime;
import java.util.Set;

import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 150, message = "Resource name cannot exceed 150 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
    private String imageUrl;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    private LocalTime availabilityStartTime;

    private LocalTime availabilityEndTime;

    @Min(value = 1, message = "Availability duration must be at least 1 minute")
    private Integer availabilityDurationMinutes;

    private Set<String> features;

    private ResourceStatus status;
}
