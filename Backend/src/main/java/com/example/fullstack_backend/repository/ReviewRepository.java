package com.example.fullstack_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fullstack_backend.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByOrderByCreatedAtDesc();

    List<Review> findTop12ByOrderByCreatedAtDesc();

    List<Review> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
