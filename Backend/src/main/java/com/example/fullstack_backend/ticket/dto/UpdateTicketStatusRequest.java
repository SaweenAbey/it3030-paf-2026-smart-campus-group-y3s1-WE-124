package com.example.fullstack_backend.ticket.dto;

import com.example.fullstack_backend.model.ResourceStatus;
import com.example.fullstack_backend.ticket.model.TicketStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    @Size(max = 3000, message = "Resolution notes cannot exceed 3000 characters")
    private String resolutionNotes;

    private ResourceStatus resourceStatus;
}
