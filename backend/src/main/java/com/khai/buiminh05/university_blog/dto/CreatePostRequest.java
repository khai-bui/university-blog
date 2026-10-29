package com.khai.buiminh05.university_blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Title must not be blank")
    private String title;

    @NotBlank(message = "Content must not be blank")
    private String content;

    @NotNull(message = "Author ID must not be null")
    private Long authorId;

    private Set<Long> tagIds;
}
