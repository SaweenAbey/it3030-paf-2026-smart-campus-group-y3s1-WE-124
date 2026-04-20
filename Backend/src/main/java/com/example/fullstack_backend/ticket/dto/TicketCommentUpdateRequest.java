package com.example.fullstack_backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentUpdateRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 3000, message = "Comment cannot exceed 3000 characters")
    private String content;
}
