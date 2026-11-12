package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.dto.PostDtos;
import com.khai.buiminh05.university_blog.entity.Post;
import com.khai.buiminh05.university_blog.entity.PostStatus;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // ---------- Review posts ----------
    @GetMapping("/posts")
    public List<PostDtos.Item> posts(@RequestParam(defaultValue = "PENDING") PostStatus status) {
        return postRepository.findByStatusOrderByIdDesc(status)
                .stream().map(PostDtos::of).toList();
    }

    private Post findPost(Long id) {
        return postRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    @PatchMapping("/posts/{id}/approve")
    public PostDtos.Item approve(@PathVariable Long id) {
        Post p = findPost(id);
        p.setStatus(PostStatus.APPROVED);
        p.setRejectReason(null);
        return PostDtos.of(postRepository.save(p));
    }

    public record RejectRequest(@Size(max = 500) String reason) {}

    @PatchMapping("/posts/{id}/reject")
    public PostDtos.Item reject(@PathVariable Long id,
                                @Valid @RequestBody(required = false) RejectRequest req) {
        Post p = findPost(id);
        p.setStatus(PostStatus.REJECTED);
        p.setRejectReason(req == null || req.reason() == null || req.reason().isBlank()
                ? "The post did not meet the requirements" : req.reason().trim());
        return PostDtos.of(postRepository.save(p));
    }

    // ---------- Manage users ----------
    public record UserItem(Long id, String username, String email, String role, boolean active) {}

    private UserItem toItem(User u) {
        return new UserItem(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name(), u.isActive());
    }

    @GetMapping("/users")
    public List<UserItem> users() {
        return userRepository.findAll().stream().map(this::toItem).toList();
    }

    public record ChangeRoleRequest(String role) {}
    public record ChangeActiveRequest(boolean active) {}

    @PatchMapping("/users/{id}/active")
    public UserItem changeActive(@PathVariable Long id,
                                 @RequestBody ChangeActiveRequest req,
                                 Authentication auth) {
        User target = userRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (target.getUsername().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot deactivate or reactivate your own account");
        }
        if (target.getRole() == User.Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Administrator accounts cannot be deactivated here");
        }
        target.setActive(req.active());
        return toItem(userRepository.save(target));
    }

    @PatchMapping("/users/{id}/role")
    public UserItem changeRole(@PathVariable Long id,
                               @RequestBody ChangeRoleRequest req,
                               Authentication auth) {
        User target = userRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (target.getUsername().equals(auth.getName()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot change your own role");
        if (target.getRole() == User.Role.ROLE_ADMIN)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You cannot change an administrator's role");

        User.Role newRole;
        try {
            newRole = User.Role.valueOf(req.role());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
        if (newRole != User.Role.ROLE_STUDENT && newRole != User.Role.ROLE_TEACHER)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Roles can only be changed between student and teacher");

        target.setRole(newRole);
        return toItem(userRepository.save(target));
    }
}
