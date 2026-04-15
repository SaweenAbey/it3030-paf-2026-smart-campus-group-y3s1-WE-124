package com.example.fullstack_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.fullstack_backend.model.Booking;
import com.example.fullstack_backend.model.Booking.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    @Query(value = """
        SELECT * FROM bookings b
        WHERE b.resource_id = :resourceId
        AND b.status IN ('PENDING', 'APPROVED')
        AND b.start_time < :endTime
        AND b.end_time > :startTime
        """, nativeQuery = true)
    List<Booking> findConflicts(
            @Param("resourceId") String resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    @Query(value = """
        SELECT * FROM bookings b
        WHERE b.resource_id = :resourceId
        AND b.id != :excludeId
        AND b.status IN ('PENDING', 'APPROVED')
        AND b.start_time < :endTime
        AND b.end_time > :startTime
        """, nativeQuery = true)
    List<Booking> findConflictsExcluding(
            @Param("resourceId") String resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Long excludeId
    );
}
