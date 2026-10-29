package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.CreateTagRequest;
import com.khai.buiminh05.university_blog.dto.TagResponse;
import com.khai.buiminh05.university_blog.entity.Tag;
import com.khai.buiminh05.university_blog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public TagResponse createTag(CreateTagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tag name already exists: " + request.getName());
        }

        Tag tag = Tag.builder()
                .name(request.getName())
                .build();

        Tag savedTag = tagRepository.save(tag);
        return mapToResponse(savedTag);
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TagResponse mapToResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}
