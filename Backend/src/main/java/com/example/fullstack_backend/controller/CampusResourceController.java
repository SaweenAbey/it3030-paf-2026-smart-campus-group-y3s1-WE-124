package com.example.fullstack_backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.example.fullstack_backend.dto.CampusResourceRequest;
import com.example.fullstack_backend.dto.CampusResourceResponse;
import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;
import com.example.fullstack_backend.service.CampusResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class CampusResourceController {

    private static final Logger logger = LoggerFactory.getLogger(CampusResourceController.class);

    @Autowired
    private CampusResourceService campusResourceService;

    // Create a new resource (Admin or Manager)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CampusResourceResponse> createResource(@Valid @RequestBody CampusResourceRequest request) {
        logger.info("Creating new campus resource with name {}", request.getName());
        return ResponseEntity.ok(campusResourceService.createResource(request));
    }

    // Update an existing resource (Admin or Manager)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<CampusResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody CampusResourceRequest request) {
        logger.info("Updating campus resource with id {}", id);
        return ResponseEntity.ok(campusResourceService.updateResource(id, request));
    }

    // Delete a resource (Admin or Manager)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable Long id) {
        logger.info("Deleting campus resource with id {}", id);
        campusResourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }

    // Get resource by id (any authenticated user)
    @GetMapping("/{id}")
    public ResponseEntity<CampusResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(campusResourceService.getResourceById(id));
    }

    // List all resources (any authenticated user)
    @GetMapping
    public ResponseEntity<List<CampusResourceResponse>> getAllResources() {
        return ResponseEntity.ok(campusResourceService.getAllResources());
    }

    // Search & filter resources by type, status, capacity, location
    @GetMapping("/search")
    public ResponseEntity<List<CampusResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        logger.info("Searching resources with type={}, status={}, minCapacity={}, location={}",
                type, status, minCapacity, location);
        return ResponseEntity.ok(campusResourceService.searchResources(type, status, minCapacity, location));
    }

    // Get all available (ACTIVE) resources
    @GetMapping("/available")
    public ResponseEntity<List<CampusResourceResponse>> getAvailableResources() {
        logger.info("Fetching all available resources");
        return ResponseEntity.ok(campusResourceService.getAvailableResources());
    }

    // Update resource status
    @PatchMapping("/{id}/status")
    public ResponseEntity<CampusResourceResponse> updateResourceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        logger.info("Updating resource {} status to {}", id, request.get("status"));
        ResourceStatus status = ResourceStatus.valueOf(request.get("status"));
        return ResponseEntity.ok(campusResourceService.updateResourceStatus(id, status));
    }
}
