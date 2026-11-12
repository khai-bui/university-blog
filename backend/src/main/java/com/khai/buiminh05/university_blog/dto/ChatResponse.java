package com.khai.buiminh05.university_blog.dto;

import java.util.List;

public record ChatResponse(String reply, List<PostHit> posts) {

    public record PostHit(Long id, String title) {}
}