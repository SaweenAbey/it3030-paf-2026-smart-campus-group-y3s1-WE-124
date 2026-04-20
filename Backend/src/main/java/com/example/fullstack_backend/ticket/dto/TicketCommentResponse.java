package com.example.fullstack_backend.ticket.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCommentResponse {

    private Long id;
    private Long ticketId;
    private Long authorId;
    private String authorUsername;
    private String authorName;
    private String content;
    private Boolean edited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
