package com.example.fullstack_backend.ticket.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
import com.example.fullstack_backend.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getVisibleTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getVisibleTickets(
                authentication.getName(),
                getRole(authentication)
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    @GetMapping("/assigned/me")
    public ResponseEntity<List<TicketResponse>> getAssignedToMe(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getAssignedToMe(authentication.getName()));
    }

    @GetMapping("/assignable-staff")
    public ResponseEntity<List<TicketAssigneeResponse>> getAssignableStaff(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getAssignableStaff(authentication.getName(), getRole(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketById(id, authentication.getName(), getRole(authentication)));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, authentication.getName(), getRole(authentication)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, authentication.getName(), getRole(authentication)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<TicketResponse> rejectTicket(
            @PathVariable Long id,
            @Valid @RequestBody RejectTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, request, authentication.getName(), getRole(authentication)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getComments(id, authentication.getName(), getRole(authentication)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentCreateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, request, authentication.getName(), getRole(authentication)));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @Valid @RequestBody TicketCommentUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.updateComment(
                id,
                commentId,
                request,
                authentication.getName(),
                getRole(authentication)
        ));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        ticketService.deleteComment(id, commentId, authentication.getName(), getRole(authentication));
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    private Role getRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .map(Role::valueOf)
                .orElse(Role.STUDENT);
    }
}
