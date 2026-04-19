package com.example.fullstack_backend.service;

import java.util.List;

import com.example.fullstack_backend.dto.ReviewRequest;
import com.example.fullstack_backend.dto.ReviewResponse;

public interface ReviewService {

    ReviewResponse createReview(String username, ReviewRequest request);

    List<ReviewResponse> getPublicReviews(int limit);

    List<ReviewResponse> getMyReviews(String username);
}
