package com.example.fullstack_backend.ticket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fullstack_backend.ticket.model.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByRaisedByUsernameOrderByCreatedAtDesc(String username);

    List<Ticket> findByAssignedToUsernameOrderByCreatedAtDesc(String username);
}
