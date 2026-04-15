package com.example.fullstack_backend.service;

import java.util.List;

import com.example.fullstack_backend.dto.BookingRequestDTO;
import com.example.fullstack_backend.dto.BookingResponseDTO;
import com.example.fullstack_backend.dto.BookingUpdateDTO;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO dto);

    List<BookingResponseDTO> getUserBookings(String userId);

    List<BookingResponseDTO> getAllBookings();

    List<BookingResponseDTO> getApprovedBookingsByResource(String resourceId);

    BookingResponseDTO updateBooking(Long id, BookingUpdateDTO dto);

    BookingResponseDTO approveBooking(Long id);

    BookingResponseDTO rejectBooking(Long id, String reason);

    BookingResponseDTO cancelBooking(Long id);
}
