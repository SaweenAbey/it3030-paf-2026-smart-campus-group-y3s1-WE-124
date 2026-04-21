package com.example.fullstack_backend.ticket.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.ticket.dto.AssignTicketRequest;
import com.example.fullstack_backend.ticket.dto.CreateTicketRequest;
import com.example.fullstack_backend.ticket.dto.RejectTicketRequest;
import com.example.fullstack_backend.ticket.dto.TicketAssigneeResponse;
import com.example.fullstack_backend.ticket.dto.TicketCommentCreateRequest;
import com.example.fullstack_backend.ticket.dto.TicketCommentResponse;
import com.example.fullstack_backend.ticket.dto.TicketCommentUpdateRequest;
import com.example.fullstack_backend.ticket.dto.TicketResponse;
import com.example.fullstack_backend.ticket.dto.UpdateTicketStatusRequest;
import com.example.fullstack_backend.ticket.model.Ticket;
import com.example.fullstack_backend.ticket.model.TicketAttachment;
import com.example.fullstack_backend.ticket.model.TicketComment;
import com.example.fullstack_backend.ticket.model.TicketPriority;
import com.example.fullstack_backend.ticket.model.TicketStatus;
import com.example.fullstack_backend.ticket.repository.TicketCommentRepository;
import com.example.fullstack_backend.ticket.repository.TicketRepository;
import com.example.fullstack_backend.ticket.service.TicketService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;

    @Override
    public TicketResponse createTicket(CreateTicketRequest request, String actorUsername) {
        User actor = getUserByUsername(actorUsername);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory())
                .referenceId(trimToNull(request.getReferenceId()))
                .priority(request.getPriority() == null ? TicketPriority.MEDIUM : request.getPriority())
                .status(TicketStatus.OPEN)
                .raisedBy(actor)
                .build();

        if (request.getAttachmentUrls() != null) {
            if (request.getAttachmentUrls().size() > 3) {
                throw new IllegalArgumentException("A ticket can include up to 3 image attachments");
            }
            request.getAttachmentUrls().stream()
                    .map(String::trim)
                    .filter(url -> !url.isBlank())
                    .forEach(url -> ticket.getAttachments().add(
                            TicketAttachment.builder()
                                    .ticket(ticket)
                                    .imageUrl(url)
                                    .build()
                    ));
        }

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getVisibleTickets(String actorUsername, Role actorRole) {
        if (isStaff(actorRole)) {
            return ticketRepository.findAll().stream()
                    .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return getMyTickets(actorUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(String actorUsername) {
        return ticketRepository.findByRaisedByUsernameOrderByCreatedAtDesc(actorUsername)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedToMe(String actorUsername) {
        return ticketRepository.findByAssignedToUsernameOrderByCreatedAtDesc(actorUsername)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketAssigneeResponse> getAssignableStaff(String actorUsername, Role actorRole) {
        if (!(actorRole == Role.ADMIN || actorRole == Role.MANAGER || actorRole == Role.TECHNICIAN)) {
            throw new IllegalArgumentException("You do not have permission to view assignable staff");
        }

        return userRepository.findByRoleInAndIsActive(List.of(Role.TECHNICIAN), true)
                .stream()
                .map(user -> TicketAssigneeResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId, String actorUsername, Role actorRole) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actorUsername, actorRole);
        return toResponse(ticket);
    }

    @Override
    public TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String actorUsername, Role actorRole) {
        if (!(actorRole == Role.ADMIN || actorRole == Role.MANAGER)) {
            throw new IllegalArgumentException("Only ADMIN or MANAGER can assign tickets");
        }

        Ticket ticket = getTicketOrThrow(ticketId);
        User reviewer = getUserByUsername(actorUsername);
        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.getAssigneeId()));

        if (assignee.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Ticket can only be assigned to TECHNICIAN staff");
        }

        ticket.setAssignedTo(assignee);
        ticket.setReviewedBy(reviewer);

        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request, String actorUsername, Role actorRole) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanUpdateStatus(ticket, actorUsername, actorRole);

        TicketStatus nextStatus = request.getStatus();
        if (nextStatus == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Use the reject endpoint for REJECTED status updates");
        }

        validateTransition(ticket.getStatus(), nextStatus);

        if ((nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CLOSED)
                && request.getResolutionNotes() != null
                && !request.getResolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        if (nextStatus == TicketStatus.RESOLVED && (ticket.getResolutionNotes() == null || ticket.getResolutionNotes().isBlank())) {
            throw new IllegalArgumentException("Resolution notes are required before resolving a ticket");
        }

        if (nextStatus == TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Only RESOLVED tickets can be CLOSED");
        }

        ticket.setStatus(nextStatus);
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse rejectTicket(Long ticketId, RejectTicketRequest request, String actorUsername, Role actorRole) {
        if (actorRole != Role.ADMIN) {
            throw new IllegalArgumentException("Only ADMIN can reject tickets");
        }

        Ticket ticket = getTicketOrThrow(ticketId);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Closed tickets cannot be rejected");
        }

        User reviewer = getUserByUsername(actorUsername);
        ticket.setReviewedBy(reviewer);
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(request.getReason().trim());

        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getComments(Long ticketId, String actorUsername, Role actorRole) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actorUsername, actorRole);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketCommentResponse addComment(Long ticketId, TicketCommentCreateRequest request, String actorUsername, Role actorRole) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actorUsername, actorRole);

        User actor = getUserByUsername(actorUsername);
        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(actor)
                .content(request.getContent().trim())
                .build();

        return toCommentResponse(ticketCommentRepository.save(comment));
    }

    @Override
    public TicketCommentResponse updateComment(
            Long ticketId,
            Long commentId,
            TicketCommentUpdateRequest request,
            String actorUsername,
            Role actorRole
    ) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actorUsername, actorRole);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        ensureCanManageComment(comment, actorUsername, actorRole);

        comment.setContent(request.getContent().trim());
        comment.setEdited(true);
        return toCommentResponse(ticketCommentRepository.save(comment));
    }

    @Override
    public void deleteComment(Long ticketId, Long commentId, String actorUsername, Role actorRole) {
        Ticket ticket = getTicketOrThrow(ticketId);
        ensureCanView(ticket, actorUsername, actorRole);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        ensureCanManageComment(comment, actorUsername, actorRole);
        ticketCommentRepository.delete(comment);
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }

        if (current == TicketStatus.REJECTED || current == TicketStatus.CLOSED) {
            throw new IllegalArgumentException("No transitions allowed from " + current);
        }

        if (current == TicketStatus.OPEN && next != TicketStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Allowed transition: OPEN -> IN_PROGRESS");
        }

        if (current == TicketStatus.IN_PROGRESS && next != TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Allowed transition: IN_PROGRESS -> RESOLVED");
        }

        if (current == TicketStatus.RESOLVED && next != TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Allowed transition: RESOLVED -> CLOSED");
        }
    }

    private void ensureCanView(Ticket ticket, String actorUsername, Role actorRole) {
        if (isStaff(actorRole)) {
            return;
        }

        boolean isReporter = ticket.getRaisedBy() != null && actorUsername.equals(ticket.getRaisedBy().getUsername());
        boolean isAssignee = ticket.getAssignedTo() != null && actorUsername.equals(ticket.getAssignedTo().getUsername());

        if (!isReporter && !isAssignee) {
            throw new IllegalArgumentException("You do not have permission to view this ticket");
        }
    }

    private void ensureCanUpdateStatus(Ticket ticket, String actorUsername, Role actorRole) {
        if (actorRole == Role.ADMIN || actorRole == Role.MANAGER) {
            return;
        }

        if (ticket.getAssignedTo() == null || !actorUsername.equals(ticket.getAssignedTo().getUsername())) {
            throw new IllegalArgumentException("Only the assigned staff member can update this ticket status");
        }
    }

    private void ensureCanManageComment(TicketComment comment, String actorUsername, Role actorRole) {
        boolean owner = comment.getAuthor() != null && actorUsername.equals(comment.getAuthor().getUsername());
        boolean admin = actorRole == Role.ADMIN;

        if (!owner && !admin) {
            throw new IllegalArgumentException("Only the comment owner or ADMIN can modify this comment");
        }
    }

    private boolean isStaff(Role role) {
        return role == Role.ADMIN || role == Role.MANAGER || role == Role.TECHNICIAN;
    }

    private Ticket getTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private TicketResponse toResponse(Ticket ticket) {
        List<TicketCommentResponse> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode("TKT-" + String.format("%05d", ticket.getId()))
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .referenceId(ticket.getReferenceId())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .raisedById(ticket.getRaisedBy() != null ? ticket.getRaisedBy().getId() : null)
                .raisedByUsername(ticket.getRaisedBy() != null ? ticket.getRaisedBy().getUsername() : null)
                .raisedByName(ticket.getRaisedBy() != null ? ticket.getRaisedBy().getName() : null)
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToUsername(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUsername() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : null)
                .reviewedById(ticket.getReviewedBy() != null ? ticket.getReviewedBy().getId() : null)
                .reviewedByUsername(ticket.getReviewedBy() != null ? ticket.getReviewedBy().getUsername() : null)
                .reviewedByName(ticket.getReviewedBy() != null ? ticket.getReviewedBy().getName() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachmentUrls(ticket.getAttachments().stream().map(TicketAttachment::getImageUrl).collect(Collectors.toList()))
                .comments(comments)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private TicketCommentResponse toCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket() != null ? comment.getTicket().getId() : null)
                .authorId(comment.getAuthor() != null ? comment.getAuthor().getId() : null)
                .authorUsername(comment.getAuthor() != null ? comment.getAuthor().getUsername() : null)
                .authorName(comment.getAuthor() != null ? comment.getAuthor().getName() : null)
                .content(comment.getContent())
                .edited(comment.getEdited())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
