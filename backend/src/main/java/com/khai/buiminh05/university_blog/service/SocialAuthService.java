package com.khai.buiminh05.university_blog.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.springframework.http.HttpHeaders;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class SocialAuthService {

    public record SocialProfile(String email, String name) {}

    @Value("${app.google.client-id}") private String googleClientId;
    private final RestTemplate rest = new RestTemplate();

    @SuppressWarnings("unchecked")
    public SocialProfile verifyGoogle(String accessToken) {
        try {
            Map<String, Object> info = rest.getForObject(
                    "https://oauth2.googleapis.com/tokeninfo?access_token={t}",
                    Map.class, accessToken);

            System.out.println("[GOOGLE] Audience from Google = " + (info == null ? null : info.get("aud")));
            System.out.println("[GOOGLE] client id backend = [" + googleClientId + "]");

            if (info == null || !googleClientId.equals(info.get("aud"))) {
                throw new BadCredentialsException("Invalid Google token");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            Map<String, Object> me = rest.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET, new HttpEntity<>(headers), Map.class).getBody();

            if (me == null || me.get("email") == null
                    || !Boolean.parseBoolean(String.valueOf(me.get("email_verified")))) {
                throw new BadCredentialsException("Google email has not been verified");
            }
            return new SocialProfile((String) me.get("email"), (String) me.get("name"));
        } catch (HttpClientErrorException e) {
            System.out.println("[GOOGLE] Google returned an error: " + e.getResponseBodyAsString());
            throw new BadCredentialsException("Invalid Google token");
        }
    }

}