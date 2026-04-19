package com.example.fullstack_backend.dto;

import jakarta.validation.constraints.Max;
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
public class ReviewRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotBlank(message = "Review title is required")
    @Size(max = 120, message = "Review title cannot exceed 120 characters")
    private String title;

    @NotBlank(message = "Review comment is required")
    @Size(max = 1200, message = "Review comment cannot exceed 1200 characters")
    private String comment;

    @Size(max = 80, message = "Support topic cannot exceed 80 characters")
    private String supportTopic;
}
