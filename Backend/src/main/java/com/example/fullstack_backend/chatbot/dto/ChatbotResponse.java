package com.example.fullstack_backend.chatbot.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotResponse {

    private String intent;
    private String answer;
    private String followUpQuestion;
    private List<String> suggestions;
    private LocalDateTime timestamp;
}
