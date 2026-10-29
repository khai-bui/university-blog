package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.CreatePostRequest;
import com.khai.buiminh05.university_blog.dto.PostResponse;
import com.khai.buiminh05.university_blog.entity.Post;
import com.khai.buiminh05.university_blog.entity.Tag;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import com.khai.buiminh05.university_blog.repository.TagRepository;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getAuthorId()));

        List<Tag> tags = (request.getTagIds() != null && !request.getTagIds().isEmpty())
                ? tagRepository.findAllById(request.getTagIds())
                : List.of();

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .tags(new HashSet<>(tags))
                .build();

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        return postRepository.findAllWithAuthorAndTags().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PostResponse mapToResponse(Post post) {
        Set<String> tagNames = new HashSet<>();
        if (post.getTags() != null) {
            post.getTags().forEach(tag -> tagNames.add(tag.getName()));
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .aiSummary(post.getAiSummary())
                .authorName(post.getAuthor() != null ? post.getAuthor().getUsername() : null)
                .tags(tagNames)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
