package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.dto.CreatePostRequest;
import com.khai.buiminh05.university_blog.dto.PostResponse;
import com.khai.buiminh05.university_blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Temporary CORS setup for local development
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Gemini summarize
    @PostMapping("/{id}/summarize")
    public ResponseEntity<PostResponse> summarizePost(@PathVariable Long id) {
        PostResponse response = postService.generateAndSaveSummary(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(postService.getPostById(id, auth));
    }
}
