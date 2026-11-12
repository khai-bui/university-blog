package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.CreateTagRequest;
import com.khai.buiminh05.university_blog.dto.TagResponse;
import com.khai.buiminh05.university_blog.entity.Tag;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import com.khai.buiminh05.university_blog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;

    @Transactional
    public TagResponse createTag(CreateTagRequest request) {
        String name = request.getName().trim();
        if (tagRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tag name already exists: " + name);
        }

        Tag tag = Tag.builder()
                .name(name)
                .build();

        Tag savedTag = tagRepository.save(tag);
        return mapToResponse(savedTag);
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag not found"));
        postRepository.findByTags_Id(id).forEach(post -> {
            post.getTags().remove(tag);
            postRepository.save(post);
        });
        tagRepository.delete(tag);
    }

    private TagResponse mapToResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}
