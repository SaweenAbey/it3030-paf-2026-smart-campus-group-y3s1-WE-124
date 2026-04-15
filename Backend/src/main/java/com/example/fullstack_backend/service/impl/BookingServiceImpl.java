package com.example.fullstack_backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.fullstack_backend.dto.BookingRequestDTO;
import com.example.fullstack_backend.dto.BookingResponseDTO;
import com.example.fullstack_backend.dto.BookingUpdateDTO;
import com.example.fullstack_backend.dto.BroadcastNotificationRequest;
import com.example.fullstack_backend.dto.CreateNotificationRequest;
import com.example.fullstack_backend.exception.ConflictException;
import com.example.fullstack_backend.model.Booking;
import com.example.fullstack_backend.model.Booking.BookingStatus;
import com.example.fullstack_backend.model.NotificationType;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.repository.BookingRepository;
import com.example.fullstack_backend.repository.CampusResourceRepository;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.service.BookingService;
import com.example.fullstack_backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final CampusResourceRepository campusResourceRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        List<Booking> conflicts = bookingRepository.findConflicts(
                dto.getResourceId(), dto.getStartTime(), dto.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new ConflictException(
                    "Resource " + dto.getResourceId()
                            + " is already booked from " + conflict.getStartTime()
                            + " to " + conflict.getEndTime()
                            + " (Status: " + conflict.getStatus() + ")"
            );
        }
        Booking booking = Booking.builder()
                .resourceId(dto.getResourceId())
                .userId(dto.getUserId())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .build();
        Booking savedBooking = bookingRepository.save(booking);
        
        // Notify all managers about the new booking request
        try {
            BroadcastNotificationRequest notificationRequest = BroadcastNotificationRequest.builder()
                    .title("📋 New Booking Request")
                    .message("New booking request submitted for resource '" + dto.getResourceId() + 
                            "' by " + dto.getUserId() + " from " + dto.getStartTime() + 
                            " to " + dto.getEndTime() + " for: " + dto.getPurpose())
                    .type(NotificationType.INFO)
                    .actionUrl("/manager/bookings/" + savedBooking.getId())
                    .build();
            notificationService.createForRole(Role.MANAGER, dto.getUserId(), notificationRequest);
        } catch (Exception e) {
            // Log but don't fail the booking creation if notification fails
            System.err.println("Failed to send manager notification: " + e.getMessage());
        }
        
        return toDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO updateBooking(Long id, BookingUpdateDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be updated");
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            if (!dto.getEndTime().isAfter(dto.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            List<Booking> conflicts = bookingRepository.findConflictsExcluding(
                    booking.getResourceId(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    id
            );
            if (!conflicts.isEmpty()) {
                throw new ConflictException("Resource already booked for this time slot!");
            }
            booking.setStartTime(dto.getStartTime());
            booking.setEndTime(dto.getEndTime());
        }

        if (dto.getPurpose() != null && !dto.getPurpose().trim().isEmpty()) {
            booking.setPurpose(dto.getPurpose());
        }
        if (dto.getExpectedAttendees() != null) {
            booking.setExpectedAttendees(dto.getExpectedAttendees());
        }

        return toDTO(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponseDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getApprovedBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        Booking savedBooking = bookingRepository.save(booking);
        
        // Notify the user that their booking has been approved
        try {
            CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                    .title("✅ Booking Approved")
                    .message("Your booking request for resource '" + booking.getResourceId() + 
                            "' from " + booking.getStartTime() + " to " + booking.getEndTime() + 
                            " has been approved!")
                    .type(NotificationType.SUCCESS)
                    .actionUrl("/bookings/" + savedBooking.getId())
                    .build();
            
            // Get the recipient user by username
            userRepository.findByUsername(booking.getUserId())
                    .ifPresent(user -> notificationService.createForUser(user.getId(), "SYSTEM", notificationRequest));
        } catch (Exception e) {
            // Log but don't fail the approval if notification fails
            System.err.println("Failed to send approval notification: " + e.getMessage());
        }
        
        return toDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be rejected");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking savedBooking = bookingRepository.save(booking);
        
        // Notify the user that their booking has been rejected
        try {
            CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                    .title("❌ Booking Request Rejected")
                    .message("Your booking request for resource '" + booking.getResourceId() + 
                            "' has been rejected.\n\nReason: " + reason)
                    .type(NotificationType.WARNING)
                    .actionUrl("/bookings/" + savedBooking.getId())
                    .build();
            
            // Get the recipient user by username
            userRepository.findByUsername(booking.getUserId())
                    .ifPresent(user -> notificationService.createForUser(user.getId(), "SYSTEM", notificationRequest));
        } catch (Exception e) {
            // Log but don't fail the rejection if notification fails
            System.err.println("Failed to send rejection notification: " + e.getMessage());
        }
        
        return toDTO(savedBooking);
    }

    @Override
    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        if (booking.getStatus() == BookingStatus.REJECTED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Cannot cancel a " + booking.getStatus() + " booking"
            );
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toDTO(bookingRepository.save(booking));
    }

    private BookingResponseDTO toDTO(Booking b) {
        return BookingResponseDTO.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .userId(b.getUserId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
