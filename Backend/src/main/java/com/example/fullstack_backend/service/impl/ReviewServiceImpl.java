package com.example.fullstack_backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.fullstack_backend.dto.ReviewRequest;
import com.example.fullstack_backend.dto.ReviewResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.model.Review;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.ReviewRepository;
import com.example.fullstack_backend.repository.UserRepository;
import com.example.fullstack_backend.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(String username, ReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Review review = Review.builder()
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle().trim())
                .comment(request.getComment().trim())
                .supportTopic(request.getSupportTopic() == null ? null : request.getSupportTopic().trim())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getPublicReviews(int limit) {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        if (limit > 0) {
            return reviews.stream().limit(limit).map(this::toResponse).toList();
        }
        return reviews.stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReviewResponse> getMyReviews(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return reviewRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        User user = review.getUser();

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .userName(user.getName())
                .userRole(user.getRole())
                .userProfileImageUrl(user.getProfileImageUrl())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .supportTopic(review.getSupportTopic())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
