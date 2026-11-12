package com.khai.buiminh05.university_blog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaStorageService {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp");

    private final Path postImageDirectory;

    public MediaStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        this.postImageDirectory = Path.of(uploadDirectory)
                .toAbsolutePath()
                .normalize()
                .resolve("posts");
    }

    public String storePostImage(MultipartFile image) {
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Image must be 5 MB or smaller");
        }

        String contentType = image.getContentType();
        String extension = EXTENSIONS.get(contentType);
        if (extension == null || !hasMatchingSignature(image, contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only valid JPEG, PNG, GIF, and WebP images are supported");
        }

        String fileName = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(postImageDirectory);
            Path destination = postImageDirectory.resolve(fileName).normalize();
            if (!destination.startsWith(postImageDirectory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image path");
            }
            try (InputStream input = image.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/posts/" + fileName;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save the uploaded image", e);
        }
    }

    private boolean hasMatchingSignature(MultipartFile image, String contentType) {
        try (InputStream input = image.getInputStream()) {
            byte[] header = input.readNBytes(12);
            return switch (contentType) {
                case "image/jpeg" -> header.length >= 3
                        && (header[0] & 0xFF) == 0xFF
                        && (header[1] & 0xFF) == 0xD8
                        && (header[2] & 0xFF) == 0xFF;
                case "image/png" -> header.length >= 8
                        && (header[0] & 0xFF) == 0x89
                        && header[1] == 'P' && header[2] == 'N' && header[3] == 'G'
                        && (header[4] & 0xFF) == 0x0D && (header[5] & 0xFF) == 0x0A
                        && (header[6] & 0xFF) == 0x1A && (header[7] & 0xFF) == 0x0A;
                case "image/gif" -> header.length >= 6
                        && header[0] == 'G' && header[1] == 'I' && header[2] == 'F'
                        && header[3] == '8' && (header[4] == '7' || header[4] == '9')
                        && header[5] == 'a';
                case "image/webp" -> header.length >= 12
                        && header[0] == 'R' && header[1] == 'I'
                        && header[2] == 'F' && header[3] == 'F'
                        && header[8] == 'W' && header[9] == 'E'
                        && header[10] == 'B' && header[11] == 'P';
                default -> false;
            };
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unable to read the uploaded image", e);
        }
    }
}
