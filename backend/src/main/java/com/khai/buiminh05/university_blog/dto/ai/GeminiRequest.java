package com.khai.buiminh05.university_blog.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeminiRequest {

    private List<Content> contents;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Part {
        private String text;
    }

    public static GeminiRequest createPrompt(String prompt) {
        return new GeminiRequest(List.of(new Content(List.of(new Part(prompt)))));
    }
}
