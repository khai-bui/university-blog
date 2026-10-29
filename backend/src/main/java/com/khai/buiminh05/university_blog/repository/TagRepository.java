package com.khai.buiminh05.university_blog.repository;

import com.khai.buiminh05.university_blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    Boolean existsByName(String name);

    List<Tag> findByNameIn(Set<String> names);
}
