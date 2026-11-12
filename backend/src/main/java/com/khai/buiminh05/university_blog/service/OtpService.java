package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.entity.EmailOtp;
import com.khai.buiminh05.university_blog.entity.PendingRegistration;
import com.khai.buiminh05.university_blog.repository.EmailOtpRepository;
import com.khai.buiminh05.university_blog.repository.PendingRegistrationRepository;
import com.khai.buiminh05.university_blog.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.transaction.annotation.Transactional;
import lombok.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OtpService {

    public record VerifiedRegistration(String username, String email, String passwordHash) {}

    private static final Duration TTL = Duration.ofMinutes(5);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final int MAX_ATTEMPTS = 5;

    private final PendingRegistrationRepository pendingRepo;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String from;

    private static String norm(String email) {
        return email.trim().toLowerCase();
    }

    /** Step 1: validate, temporarily save registration details, and send a code. The account is NOT created yet. */
    @Transactional
    public void startRegistration(String username, String rawEmail, String rawPassword) {
        String email = norm(rawEmail);
        Instant now = Instant.now();

        if (userRepository.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        if (userRepository.existsByUsername(username))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");

        // Reject usernames that are currently reserved by another pending registration
        pendingRepo.findByUsername(username).ifPresent(p -> {
            if (!p.getEmail().equals(email) && now.isBefore(p.getExpiresAt()))
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Username is currently reserved. Please choose another one.");
        });

        PendingRegistration p = pendingRepo.findByEmail(email).orElseGet(PendingRegistration::new);
        if (p.getLastSentAt() != null && now.isBefore(p.getLastSentAt().plus(RESEND_COOLDOWN)))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait 60 seconds before requesting another code.");

        p.setEmail(email);
        p.setUsername(username);
        p.setPasswordHash(passwordEncoder.encode(rawPassword));
        issueCode(p, now);
    }

    /** Resend a code for a pending registration. Stay silent if none exists to avoid revealing registered emails. */
    @Transactional
    public void resend(String rawEmail) {
        Instant now = Instant.now();
        pendingRepo.findByEmail(norm(rawEmail)).ifPresent(p -> {
            if (now.isBefore(p.getLastSentAt().plus(RESEND_COOLDOWN)))
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait 60 seconds before requesting another code.");
            issueCode(p, now);
        });
    }

    /** Step 2: verify the code. If valid, return the registration details to create the account. */
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public VerifiedRegistration verify(String rawEmail, String code) {
        PendingRegistration p = pendingRepo.findByEmail(norm(rawEmail)).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The code is invalid or has expired. Please register again."));

        if (Instant.now().isAfter(p.getExpiresAt())) {
            pendingRepo.delete(p);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The code has expired. Please register again.");
        }
        if (p.getAttempts() >= MAX_ATTEMPTS) {
            pendingRepo.delete(p);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect attempts. Please register again.");
        }
        if (code == null || !passwordEncoder.matches(code.trim(), p.getCodeHash())) {
            p.setAttempts(p.getAttempts() + 1);
            pendingRepo.save(p);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect code");
        }

        pendingRepo.delete(p);   // One-time use
        return new VerifiedRegistration(p.getUsername(), p.getEmail(), p.getPasswordHash());
    }

    private void issueCode(PendingRegistration p, Instant now) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        p.setCodeHash(passwordEncoder.encode(code));
        p.setExpiresAt(now.plus(TTL));
        p.setLastSentAt(now);
        p.setAttempts(0);
        pendingRepo.save(p);

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(p.getEmail());
            msg.setSubject("University Blog verification code");
            msg.setText("Your verification code is: " + code
                    + "\n\nThis code expires in 5 minutes. "
                    + "If you did not request it, please ignore this email.");
            mailSender.send(msg);
        } catch (MailException e) {
            e.printStackTrace();
            // Throwing an exception rolls back the save above, preventing an orphaned record if email delivery fails
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Unable to send the email. Please try again later.");
        }
    }
}
