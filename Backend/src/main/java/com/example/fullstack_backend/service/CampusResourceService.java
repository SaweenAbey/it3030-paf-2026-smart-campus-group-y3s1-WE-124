package com.example.fullstack_backend.service;

import java.util.List;

import com.example.fullstack_backend.dto.CampusResourceRequest;
import com.example.fullstack_backend.dto.CampusResourceResponse;
import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;

public interface CampusResourceService {

    CampusResourceResponse createResource(CampusResourceRequest request);

    CampusResourceResponse updateResource(Long id, CampusResourceRequest request);

    void deleteResource(Long id);

    CampusResourceResponse getResourceById(Long id);

    List<CampusResourceResponse> getAllResources();

    List<CampusResourceResponse> searchResources(ResourceType type, ResourceStatus status, Integer minCapacity, String location);

    List<CampusResourceResponse> getAvailableResources();

    CampusResourceResponse updateResourceStatus(Long id, ResourceStatus status);
}
