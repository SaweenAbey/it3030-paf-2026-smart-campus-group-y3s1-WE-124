package com.example.demo.service;

import com.example.demo.dto.BookingRequestDTO;
import com.example.demo.dto.BookingResponseDTO;
import com.example.demo.dto.BookingUpdateDTO;
import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO dto);
    List<BookingResponseDTO> getUserBookings(String userId);
    List<BookingResponseDTO> getAllBookings();
    BookingResponseDTO updateBooking(Long id, BookingUpdateDTO dto);
    BookingResponseDTO approveBooking(Long id);
    BookingResponseDTO rejectBooking(Long id, String reason);
    BookingResponseDTO cancelBooking(Long id);
}