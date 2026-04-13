package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingUpdateDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}