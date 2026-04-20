package com.example.fullstack_backend.ticket.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.fullstack_backend.ticket.model.TicketCategory;
import com.example.fullstack_backend.ticket.model.TicketPriority;
import com.example.fullstack_backend.ticket.model.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;
    private String ticketCode;
    private String title;
    private String description;
    private TicketCategory category;
    private String referenceId;
    private TicketStatus status;
    private TicketPriority priority;

    private Long raisedById;
    private String raisedByUsername;
    private String raisedByName;

    private Long assignedToId;
    private String assignedToUsername;
    private String assignedToName;

    private Long reviewedById;
    private String reviewedByUsername;
    private String reviewedByName;

    private String resolutionNotes;
    private String rejectionReason;

    private List<String> attachmentUrls;
    private List<TicketCommentResponse> comments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
