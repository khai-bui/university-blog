package com.khai.buiminh05.university_blog.dto;

import com.khai.buiminh05.university_blog.entity.Post;

import java.util.List;

public final class PostDtos {
    public record Item(Long id, String title, String content,
                       String status, String authorName, String rejectReason,
                       String imageUrl, String imageAlt) {}

    public record EditItem(Long id, String title, String content,
                           String imageUrl, String imageAlt, List<Long> tagIds) {}

    public static Item of(Post p) {
        return new Item(p.getId(), p.getTitle(), p.getContent(), p.getStatus().name(),
                p.getAuthor() == null ? null : p.getAuthor().getUsername(),
                p.getRejectReason(), p.getImageUrl(), p.getImageAlt());
    }

    public static EditItem forEdit(Post p) {
        return new EditItem(p.getId(), p.getTitle(), p.getContent(), p.getImageUrl(),
                p.getImageAlt(), p.getTags().stream().map(tag -> tag.getId()).toList());
    }
}
