package com.example.fullstack_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.fullstack_backend.model.CampusResource;
import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.model.ResourceType;

public interface CampusResourceRepository extends JpaRepository<CampusResource, Long> {

    @Query("SELECT r FROM CampusResource r " +
           "WHERE (:type IS NULL OR r.type = :type) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity) " +
           "AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<CampusResource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location);
}
