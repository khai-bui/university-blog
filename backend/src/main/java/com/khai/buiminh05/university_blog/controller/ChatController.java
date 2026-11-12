package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.dto.ChatRequest;
import com.khai.buiminh05.university_blog.dto.ChatResponse;
import com.khai.buiminh05.university_blog.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.chat(request);
    }
}