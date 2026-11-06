package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.ai.GeminiRequest;
import com.khai.buiminh05.university_blog.dto.ai.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Service
public class AIService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public AIService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(15));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public String summarizePostContent(String content) {
        String prompt = """
        Summarize the following university blog post for students.
        Rules:
        - Write the summary based on its language
        - Use as many bullet points as the content needs: 2-3 for short posts, up to 6 for long ones. Do not pad.
        - Put each bullet on its own line, starting with "- ".
        - Keep each bullet short (under 25 words) and include key facts such as dates, deadlines, and numbers.
        - Plain text only: no markdown formatting (no **, no #), no introduction, no closing remarks.

        Blog post:
        """ + content;

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