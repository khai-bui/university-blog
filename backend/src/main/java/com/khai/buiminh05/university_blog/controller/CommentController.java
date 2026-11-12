package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.dto.CommentDtos;
import com.khai.buiminh05.university_blog.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public List<CommentDtos.Item> getComments(@PathVariable Long postId) {
        return commentService.getForPost(postId);
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDtos.Item> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDtos.CreateRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.create(postId, request, auth));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication auth) {
        commentService.delete(commentId, auth);
        return ResponseEntity.noContent().build();
    }
}
