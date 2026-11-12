package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.dto.PostDtos;
import com.khai.buiminh05.university_blog.entity.Post;
import com.khai.buiminh05.university_blog.entity.PostStatus;
import com.khai.buiminh05.university_blog.entity.Tag;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import com.khai.buiminh05.university_blog.repository.TagRepository;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import com.khai.buiminh05.university_blog.service.MediaStorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostSubmissionController {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final MediaStorageService mediaStorageService;

    public record CreatePostRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 20000) String content,
            @Size(max = 300) String imageAlt,
            List<@NotNull @Positive Long> tagIds) {}

    private User current(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication session"));
    }

    @Transactional
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostDtos.Item> create(
            @Valid @RequestPart("post") CreatePostRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> inlineImages,
            Authentication auth) {
        User author = current(auth);
        Post p = new Post();
        p.setTitle(req.title().trim());
        p.setContent(req.content().trim());
        p.setAuthor(author);
        p.setStatus(PostStatus.PENDING);      // Always pending review; users cannot choose the status

        p.setTags(new HashSet<>(findTags(req.tagIds())));

        if (image != null && !image.isEmpty()) {
            String imageUrl = mediaStorageService.storePostImage(image);
            p.setImageUrl(imageUrl);
            p.setImageAlt(req.imageAlt() == null || req.imageAlt().isBlank()
                    ? p.getTitle() : req.imageAlt().trim());
        }

        p.setContent(processContent(p.getContent(), inlineImages));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PostDtos.of(postRepository.save(p)));
    }

    @Transactional
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public PostDtos.Item update(
            @PathVariable Long id,
            @Valid @RequestPart("post") CreatePostRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> inlineImages,
            Authentication auth) {
        Post post = postRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        requireOwner(post, auth);

        List<Tag> tags = findTags(req.tagIds());
        post.setTitle(req.title().trim());
        post.setContent(processContent(req.content().trim(), inlineImages));
        post.setTags(new HashSet<>(tags));
        if (image != null && !image.isEmpty()) {
            post.setImageUrl(mediaStorageService.storePostImage(image));
            post.setImageAlt(req.imageAlt() == null || req.imageAlt().isBlank()
                    ? post.getTitle() : req.imageAlt().trim());
        } else if (req.imageAlt() != null) {
            post.setImageAlt(req.imageAlt().isBlank() ? null : req.imageAlt().trim());
        }
        post.setStatus(PostStatus.PENDING);
        post.setRejectReason(null);
        return PostDtos.of(postRepository.save(post));
    }

    @GetMapping("/{id}/edit")
    @Transactional(readOnly = true)
    public PostDtos.EditItem editDetails(@PathVariable Long id, Authentication auth) {
        Post post = postRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        requireOwner(post, auth);
        return PostDtos.forEdit(post);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        Post post = postRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin) requireOwner(post, auth);
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    private List<Tag> findTags(List<Long> requestedTagIds) {
        List<Long> ids = requestedTagIds == null ? List.of() : requestedTagIds;
        Set<Long> uniqueIds = new HashSet<>(ids);
        if (uniqueIds.size() != ids.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate tag ids are not allowed");
        }
        List<Tag> tags = tagRepository.findAllById(uniqueIds);
        if (tags.size() != uniqueIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more selected tags do not exist");
        }
        return tags;
    }

    private void requireOwner(Post post, Authentication auth) {
        if (post.getAuthor() == null || !post.getAuthor().getUsername().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own posts");
        }
    }

    private String processContent(String content, List<MultipartFile> inlineImages) {
        if (inlineImages == null) return content;
        for (MultipartFile inlineImage : inlineImages) {
            String originalName = inlineImage.getOriginalFilename();
            String token = originalName == null ? "" : originalName.replaceFirst("\\.[^.]+$", "");
            try {
                UUID.fromString(token);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid inline image reference");
            }
            String imageUrl = mediaStorageService.storePostImage(inlineImage);
            content = content.replace("inline-image:" + token, imageUrl);
        }
        return content;
    }

    @GetMapping("/mine")
    public List<PostDtos.Item> mine(Authentication auth) {
        return postRepository.findByAuthorOrderByIdDesc(current(auth))
                .stream().map(PostDtos::of).toList();
    }
}
