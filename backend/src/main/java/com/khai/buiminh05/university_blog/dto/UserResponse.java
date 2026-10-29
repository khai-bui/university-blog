package com.khai.buiminh05.university_blog.dto;

import com.khai.buiminh05.university_blog.entity.User.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}