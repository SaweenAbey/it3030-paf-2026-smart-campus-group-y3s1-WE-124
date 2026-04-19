package com.example.fullstack_backend.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotRequest {

    @NotBlank(message = "Question is required")
    @Size(max = 500, message = "Question cannot exceed 500 characters")
    private String question;
}
