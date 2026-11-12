package com.khai.buiminh05.university_blog.repository;

import com.khai.buiminh05.university_blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
            select c from Comment c
            join fetch c.user
            where c.post.id = :postId
            order by c.createdAt asc, c.id asc
            """)
    List<Comment> findAllForPost(@Param("postId") Long postId);
}
