package com.example.fullstack_backend.chatbot;

import java.util.List;

import com.example.fullstack_backend.chatbot.dto.ChatbotRequest;
import com.example.fullstack_backend.chatbot.dto.ChatbotResponse;

public interface ChatbotService {

    ChatbotResponse ask(String username, ChatbotRequest request);

    List<String> getDefaultSuggestions();
}
