package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.CommentDtos;
import com.khai.buiminh05.university_blog.entity.Comment;
import com.khai.buiminh05.university_blog.entity.Post;
import com.khai.buiminh05.university_blog.entity.PostStatus;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.CommentRepository;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentDtos.Item> getForPost(Long postId) {
        requirePublishedPost(postId);
        return commentRepository.findAllForPost(postId).stream()
                .map(CommentDtos.Item::from)
                .toList();
    }

    @Transactional
    public CommentDtos.Item create(Long postId, CommentDtos.CreateRequest request, Authentication auth) {
        Post post = requirePublishedPost(postId);
        User user = userRepository.findByUsername(auth.getName())
                .filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "An active account is required to comment"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(request.content().trim());
        return CommentDtos.Item.from(commentRepository.save(comment));
    }

    @Transactional
    public void delete(Long commentId, Authentication auth) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        boolean admin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !comment.getUser().getUsername().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private Post requirePublishedPost(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (post.getStatus() != PostStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        return post;
    }
}
