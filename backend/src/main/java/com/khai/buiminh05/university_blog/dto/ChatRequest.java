package com.khai.buiminh05.university_blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ChatRequest(
        @NotBlank @Size(max = 1000) String message,
        Long postId,
        List<Turn> history) {

    public record Turn(String role, String text) {}
}