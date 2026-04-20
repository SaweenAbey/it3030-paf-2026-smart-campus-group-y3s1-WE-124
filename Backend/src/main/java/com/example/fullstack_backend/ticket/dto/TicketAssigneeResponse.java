package com.example.fullstack_backend.ticket.dto;

import com.example.fullstack_backend.model.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAssigneeResponse {

    private Long id;
    private String username;
    private String name;
    private Role role;
}
