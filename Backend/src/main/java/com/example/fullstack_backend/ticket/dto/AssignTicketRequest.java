package com.example.fullstack_backend.ticket.dto;

import com.example.fullstack_backend.model.ResourceStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTicketRequest {

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    private ResourceStatus resourceStatus;
}
