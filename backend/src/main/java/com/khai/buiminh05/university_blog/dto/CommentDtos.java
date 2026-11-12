package com.khai.buiminh05.university_blog.dto;

import com.khai.buiminh05.university_blog.entity.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class CommentDtos {
    private CommentDtos() {}

    public record CreateRequest(@NotBlank @Size(max = 2000) String content) {}

    public record Item(Long id, String content, LocalDateTime createdAt,
                       String authorName, Long authorId) {
        public static Item from(Comment comment) {
            return new Item(comment.getId(), comment.getContent(), comment.getCreatedAt(),
                    comment.getUser().getUsername(), comment.getUser().getId());
        }
    }
}
