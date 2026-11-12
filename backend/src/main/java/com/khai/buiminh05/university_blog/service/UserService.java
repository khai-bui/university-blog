package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.controller.UserController;
import com.khai.buiminh05.university_blog.dto.CreateUserRequest;
import com.khai.buiminh05.university_blog.dto.UserResponse;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.khai.buiminh05.university_blog.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // Student
    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(User.Role.ROLE_STUDENT)
                .build();
        return userRepository.save(user);
    }

    // Admin
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword()) // Plain text for now; integrate BCrypt when adding Spring Security
                .email(request.getEmail())
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public User findOrCreateSocialUser(String email, String name) {
        Optional<User> existing = userRepository.findByEmail(email);

        // Case 1: this email already has an account
        if (existing.isPresent()) {
            User u = existing.get();
            if (!u.isActive()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "This account has been deactivated");
            }
            if (!u.isEmailVerified()) {
                u.setEmailVerified(true);
                u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                return userRepository.save(u);
            }
            return u;
        }

        // Case 2: no account exists yet; create one from the Google profile
        String base = email.substring(0, email.indexOf('@'));
        String username = base;
        int i = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + i++;
        }

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        u.setRole(User.Role.ROLE_STUDENT);
        u.setEmailVerified(true);          // Google has already verified this email
        return userRepository.save(u);
    }

    public User createVerifiedUser(String username, String email, String passwordHash) {
        if (userRepository.existsByUsername(username))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
        if (userRepository.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordHash);          // Already hashed during registration; do not hash it again
        u.setRole(User.Role.ROLE_STUDENT);
        u.setEmailVerified(true);
        // If registerUser assigns any other fields (such as the creation date), assign them here too
        return userRepository.save(u);
    }
}
