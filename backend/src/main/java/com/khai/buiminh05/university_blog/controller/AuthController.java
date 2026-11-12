package com.khai.buiminh05.university_blog.controller;

import com.khai.buiminh05.university_blog.config.JwtService;
import com.khai.buiminh05.university_blog.dto.AuthResponse;
import com.khai.buiminh05.university_blog.dto.LoginRequest;
import com.khai.buiminh05.university_blog.dto.RegisterRequest;
import com.khai.buiminh05.university_blog.entity.User;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import com.khai.buiminh05.university_blog.service.OtpService;
import com.khai.buiminh05.university_blog.service.SocialAuthService;
import com.khai.buiminh05.university_blog.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SocialAuthService socialAuthService;
    public record VerifyOtpRequest(String email, String code) {}
    public record ResendOtpRequest(String email) {}
    private final OtpService otpService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Optional<User> found = userRepository.findByUsername(req.username());

        if (found.isEmpty() || !passwordEncoder.matches(req.password(), found.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Wrong Username Or Password"));
        }

        User user = found.get();
        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "This account has been deactivated"));
        }
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "code", "EMAIL_NOT_VERIFIED",
                    "message", "Email has not been verified",
                    "email", user.getEmail()));
        }
        String role = user.getRole().name();
        String token = jwtService.generateToken(user.getUsername(), role);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), role));
    }

    public record SocialLoginRequest(String token) {}

    @PostMapping("/google")
    public ResponseEntity<?> google(@RequestBody SocialLoginRequest req) {
        try {
            var profile = socialAuthService.verifyGoogle(req.token());
            return ResponseEntity.ok(buildAuthResponse(
                    userService.findOrCreateSocialUser(profile.email(), profile.name())));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", e.getReason() == null ? "Login failed" : e.getReason()));
        } catch (Exception e) {
            e.printStackTrace();   // Print the actual cause in the IntelliJ console
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Google verification failed. Please try again later."));
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String role = user.getRole().name();
        return new AuthResponse(
                jwtService.generateToken(user.getUsername(), role), user.getUsername(), role);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim();
        otpService.startRegistration(req.username().trim(), email, req.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "email", email,
                "message", "A verification code has been sent to your email"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        var reg = otpService.verify(req.email(), req.code());
        User user = userService.createVerifiedUser(reg.username(), reg.email(), reg.passwordHash());
        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody ResendOtpRequest req) {
        otpService.resend(req.email());
        return ResponseEntity.ok(Map.of("message", "If the email is valid, a new code has been sent"));
    }
}