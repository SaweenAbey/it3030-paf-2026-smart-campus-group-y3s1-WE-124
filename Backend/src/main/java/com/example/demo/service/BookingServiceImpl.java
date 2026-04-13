package com.example.demo.service;

import com.example.demo.dto.BookingRequestDTO;
import com.example.demo.dto.BookingResponseDTO;
import com.example.demo.dto.BookingUpdateDTO;
import com.example.demo.exception.ConflictException;
import com.example.demo.model.Booking;
import com.example.demo.model.Booking.BookingStatus;
import com.example.demo.repo.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        List<Booking> conflicts = bookingRepository.findConflicts(
                dto.getResourceId(), dto.getStartTime(), dto.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new ConflictException(
                    "Resource " + dto.getResourceId() +
                            " is already booked from " + conflict.getStartTime() +
                            " to " + conflict.getEndTime() +
                            " (Status: " + conflict.getStatus() + ")"
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
        return toDTO(bookingRepository.save(booking));
    }

    @Override
    public BookingResponseDTO updateBooking(Long id, BookingUpdateDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be updated");
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            if (!dto.getEndTime().isAfter(dto.getStartTime())) {
                throw new RuntimeException("End time must be after start time");
            }
            List<Booking> conflicts = bookingRepository.findConflictsExcluding(
                    booking.getResourceId(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    id
            );
            if (!conflicts.isEmpty()) {
                throw new ConflictException(
                        "Resource already booked for this time slot!"
                );
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
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        return toDTO(bookingRepository.save(booking));
    }

    @Override
    public BookingResponseDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return toDTO(bookingRepository.save(booking));
    }

    @Override
    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        if (booking.getStatus() == BookingStatus.REJECTED ||
                booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException(
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