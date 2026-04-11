package com.example.fullstack_backend.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResourceResponse {

    private Long id;
    private String name;
    private String description;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;
    private ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
