package com.example.fullstack_backend.chatbot;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstack_backend.chatbot.dto.ChatbotRequest;
import com.example.fullstack_backend.chatbot.dto.ChatbotResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(
            @Valid @RequestBody ChatbotRequest request,
            Authentication auth) {
        return ResponseEntity.ok(chatbotService.ask(auth.getName(), request));
    }

    @GetMapping("/help")
    public ResponseEntity<Map<String, Object>> help() {
        return ResponseEntity.ok(Map.of("suggestions", chatbotService.getDefaultSuggestions()));
    }
}
