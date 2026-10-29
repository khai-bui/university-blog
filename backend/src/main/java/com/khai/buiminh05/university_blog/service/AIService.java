package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.ai.GeminiRequest;
import com.khai.buiminh05.university_blog.dto.ai.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AIService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public AIService() {
        this.restClient = RestClient.create();
    }

    public String summarizePostContent(String content) {
        String prompt = "Summarize the following university blog post concisely in 2-3 key points. Keep the language clear and suited for students:\n\n" + content;

        GeminiRequest requestBody = GeminiRequest.createPrompt(prompt);

        try {
            GeminiResponse response = restClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(GeminiResponse.class);

            return response != null ? response.extractResponseText() : "Failed to obtain summary from AI.";
        } catch (Exception e) {
            return "AI Summarization is currently unavailable. Error: " + e.getMessage();
        }
    }
}