package com.khai.buiminh05.university_blog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private String aiSummary;
    private String authorName;
    private Set<String> tags;
    private LocalDateTime createdAt;
}