package com.example.fullstack_backend.ticket.dto;

import java.util.List;

import com.example.fullstack_backend.ticket.model.TicketCategory;
import com.example.fullstack_backend.ticket.model.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 180, message = "Title must be between 5 and 180 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 3000, message = "Description must be between 20 and 3000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @Size(max = 120, message = "Reference ID cannot exceed 120 characters")
    private String referenceId;

    private TicketPriority priority;

    @NotNull(message = "Attachments are required")
    @Size(min = 1, max = 3, message = "You must provide between 1 and 3 evidence images")
    private List<@NotBlank(message = "Attachment URL cannot be blank") String> attachmentUrls;
}
