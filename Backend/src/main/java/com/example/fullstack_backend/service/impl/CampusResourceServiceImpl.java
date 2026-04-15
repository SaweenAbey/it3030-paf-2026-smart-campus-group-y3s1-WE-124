package com.example.fullstack_backend.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fullstack_backend.dto.CampusResourceRequest;
import com.example.fullstack_backend.dto.CampusResourceResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.model.CampusResource;
import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;
import com.example.fullstack_backend.repository.CampusResourceRepository;
import com.example.fullstack_backend.service.CampusResourceService;

@Service
@Transactional
public class CampusResourceServiceImpl implements CampusResourceService {

    private static final Logger logger = LoggerFactory.getLogger(CampusResourceServiceImpl.class);

    @Autowired
    private CampusResourceRepository campusResourceRepository;

    @Override
    public CampusResourceResponse createResource(CampusResourceRequest request) {
        CampusResource resource = CampusResource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityDurationMinutes(request.getAvailabilityDurationMinutes())
                .features(normalizeFeatures(request.getFeatures()))
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .build();

        CampusResource saved = campusResourceRepository.save(resource);
        logger.info("Created campus resource with id {} and name {}", saved.getId(), saved.getName());
        return mapToResponse(saved);
    }

    @Override
    public CampusResourceResponse updateResource(Long id, CampusResourceRequest request) {
        CampusResource existing = campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setImageUrl(request.getImageUrl());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setAvailabilityDurationMinutes(request.getAvailabilityDurationMinutes());
        existing.setFeatures(normalizeFeatures(request.getFeatures()));
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }

        CampusResource updated = campusResourceRepository.save(existing);
        logger.info("Updated campus resource with id {}", id);
        return mapToResponse(updated);
    }

    @Override
    public void deleteResource(Long id) {
        CampusResource existing = campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        campusResourceRepository.delete(existing);
        logger.info("Deleted campus resource with id {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public CampusResourceResponse getResourceById(Long id) {
        CampusResource resource = campusResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampusResourceResponse> getAllResources() {
        return campusResourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampusResourceResponse> searchResources(ResourceType type, ResourceStatus status, Integer minCapacity, String location) {
        List<CampusResource> resources = campusResourceRepository.searchResources(type, status, minCapacity, location);
        return resources.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CampusResourceResponse mapToResponse(CampusResource resource) {
        return CampusResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .imageUrl(resource.getImageUrl())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availabilityDurationMinutes(resource.getAvailabilityDurationMinutes())
                .features(resource.getFeatures())
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    private Integer resolveDurationMinutes(CampusResourceRequest request) {
        return request.getAvailabilityDurationMinutes() != null && request.getAvailabilityDurationMinutes() > 0
                ? request.getAvailabilityDurationMinutes()
                : null;
    }

    private Set<String> normalizeFeatures(Set<String> incomingFeatures) {
        if (incomingFeatures == null || incomingFeatures.isEmpty()) {
            return new HashSet<>();
        }

        return incomingFeatures.stream()
                .filter(feature -> feature != null && !feature.trim().isEmpty())
                .map(String::trim)
                .collect(Collectors.toCollection(HashSet::new));
    }
}
