package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.ai.GeminiRequest;
import com.khai.buiminh05.university_blog.dto.ai.GeminiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@Slf4j
@Service
public class AIService {

    private static final String UNAVAILABLE_MESSAGE = "The AI is currently unavailable. Please try again later.";

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public AIService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    /** Send a prompt and return the text. Throws ResponseStatusException if the AI request fails. */
    public String generate(String prompt) {
        long start = System.currentTimeMillis();
        try {
            GeminiResponse response = restClient.post()
                    .uri(apiUrl.trim() + "?key=" + apiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(GeminiRequest.createPrompt(prompt))
                    .retrieve()
                    .body(GeminiResponse.class);

            log.info("Gemini responded in {} ms", System.currentTimeMillis() - start);

            String text = response != null ? response.extractResponseText() : null;
            if (text == null || text.isBlank()) {
                log.error("Gemini returned no text. Response: {}", response);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The AI returned no content");
            }
            return text.trim();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RestClientResponseException e) {
            log.error("Gemini HTTP {} after {} ms: {}",
                    e.getStatusCode(), System.currentTimeMillis() - start, e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, UNAVAILABLE_MESSAGE);
        } catch (Exception e) {
            log.error("Gemini call failed after {} ms: {}", System.currentTimeMillis() - start, e.toString(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, UNAVAILABLE_MESSAGE);
        }
    }

    public String summarizePostContent(String content) {
        String prompt = """
                Summarize the following university blog post for students.
                Rules:
                - Write the summary in based on the post language.
                - Use as many bullet points as the content needs: 2-3 for short posts, up to 6 for long ones. Do not pad.
                - Put each bullet on its own line, starting with "- ".
                - Keep each bullet short (under 25 words) and include key facts such as dates, deadlines, and numbers.
                - Plain text only: no markdown formatting (no **, no #), no introduction, no closing remarks.

                Blog post:
                """ + content;
        try {
            return generate(prompt);
        } catch (ResponseStatusException e) {
            return "AI Summarization is currently unavailable. Error: " + e.getReason();
        }
    }
}