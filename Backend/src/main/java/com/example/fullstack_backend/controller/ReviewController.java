package com.example.fullstack_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstack_backend.dto.ReviewRequest;
import com.example.fullstack_backend.dto.ReviewResponse;
import com.example.fullstack_backend.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication auth) {
        ReviewResponse created = reviewService.createReview(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication auth) {
        return ResponseEntity.ok(reviewService.getMyReviews(auth.getName()));
    }

    @GetMapping("/public")
    public ResponseEntity<List<ReviewResponse>> getPublicReviews(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(reviewService.getPublicReviews(limit));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}
