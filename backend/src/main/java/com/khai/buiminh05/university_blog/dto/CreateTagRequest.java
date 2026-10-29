package com.khai.buiminh05.university_blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTagRequest {

    @NotBlank(message = "Tag name must not be blank")
    @Size(max = 50, message = "Tag name must not exceed 50 characters")
    private String name;
}