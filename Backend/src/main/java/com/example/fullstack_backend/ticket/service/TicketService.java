package com.example.fullstack_backend.ticket.service;

import java.util.List;

import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.ticket.dto.AssignTicketRequest;
import com.example.fullstack_backend.ticket.dto.CreateTicketRequest;
import com.example.fullstack_backend.ticket.dto.RejectTicketRequest;
import com.example.fullstack_backend.ticket.dto.TicketAssigneeResponse;
import com.example.fullstack_backend.ticket.dto.TicketCommentCreateRequest;
import com.example.fullstack_backend.ticket.dto.TicketCommentResponse;
import com.example.fullstack_backend.ticket.dto.TicketCommentUpdateRequest;
import com.example.fullstack_backend.ticket.dto.TicketResponse;
import com.example.fullstack_backend.ticket.dto.UpdateTicketStatusRequest;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request, String actorUsername);

    List<TicketResponse> getVisibleTickets(String actorUsername, Role actorRole);

    List<TicketResponse> getMyTickets(String actorUsername);

    List<TicketResponse> getAssignedToMe(String actorUsername);

    List<TicketAssigneeResponse> getAssignableStaff(String actorUsername, Role actorRole);

    TicketResponse getTicketById(Long ticketId, String actorUsername, Role actorRole);

    TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String actorUsername, Role actorRole);

    TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request, String actorUsername, Role actorRole);

    TicketResponse rejectTicket(Long ticketId, RejectTicketRequest request, String actorUsername, Role actorRole);

    List<TicketCommentResponse> getComments(Long ticketId, String actorUsername, Role actorRole);

    TicketCommentResponse addComment(Long ticketId, TicketCommentCreateRequest request, String actorUsername, Role actorRole);

    TicketCommentResponse updateComment(
            Long ticketId,
            Long commentId,
            TicketCommentUpdateRequest request,
            String actorUsername,
            Role actorRole
    );

    void deleteComment(Long ticketId, Long commentId, String actorUsername, Role actorRole);
}
