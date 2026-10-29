package com.khai.buiminh05.university_blog.repository;

import com.khai.buiminh05.university_blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Prevent N+1 query problem by fetch joining Author and Tags
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.tags ORDER BY p.createdAt DESC")
    List<Post> findAllWithAuthorAndTags();
}
