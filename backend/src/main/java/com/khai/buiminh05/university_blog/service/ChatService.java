package com.khai.buiminh05.university_blog.service;

import com.khai.buiminh05.university_blog.dto.ChatRequest;
import com.khai.buiminh05.university_blog.dto.ChatResponse;
import com.khai.buiminh05.university_blog.entity.Post;
import com.khai.buiminh05.university_blog.entity.PostStatus;
import com.khai.buiminh05.university_blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Pattern IDS_LINE = Pattern.compile("(?im)^\\s*IDS:\\s*(.*)$");
    private static final int MAX_DOC_CHARS = 12000;
    private static final int MAX_CATALOG_POSTS = 100;

    private final PostRepository postRepository;
    private final AIService aiService;

    public ChatResponse chat(ChatRequest req) {
        return req.postId() != null ? chatAboutPost(req) : searchPosts(req);
    }

    // ---------- Post detail page: Q&A / summarize a post ----------
    private ChatResponse chatAboutPost(ChatRequest req) {
        Post post = postRepository.findById(req.postId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String content = post.getContent() == null ? "" : post.getContent();
        if (content.length() > MAX_DOC_CHARS) content = content.substring(0, MAX_DOC_CHARS);

        String prompt = """
                You are a reading assistant on a university blog.
                Answer ONLY from the document below. If the answer is not in the document, say you could not find it.
                Reply in the same language as the document, using the document (including its title)
                to determine the language rather than the user's message or conversation history.
                If the document contains multiple languages, use its dominant language.
                Be concise. Plain text only: no markdown symbols such as ** or #.
                For lists, put each item on its own line starting with "- ".

                Document title: %s
                Document:
                %s

                Conversation so far:
                %s

                User: %s
                """.formatted(post.getTitle(), content, formatHistory(req.history()), req.message());

        return new ChatResponse(aiService.generate(prompt), List.of());
    }

    // ---------- Home page: find posts based on the user's needs ----------
    private ChatResponse searchPosts(ChatRequest req) {
        Set<Long> excludedPostIds = req.excludePostIds() == null
                ? Set.of()
                : new HashSet<>(req.excludePostIds());
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED).stream()
                .filter(post -> !excludedPostIds.contains(post.getId()))
                .limit(MAX_CATALOG_POSTS)
                .toList();

        if (posts.isEmpty()) {
            String reply = excludedPostIds.isEmpty()
                    ? "There are currently no published posts to recommend."
                    : "I've already recommended all available posts in this chat. Try asking about a different topic.";
            return new ChatResponse(reply, List.of());
        }

        Map<Long, Post> byId = posts.stream().collect(Collectors.toMap(Post::getId, p -> p, (a, b) -> a));

        StringBuilder catalog = new StringBuilder();
        for (Post p : posts) {
            String snippet = p.getContent() == null ? "" : p.getContent().replaceAll("\\s+", " ");
            if (snippet.length() > 150) snippet = snippet.substring(0, 150) + "...";
            catalog.append("[id=").append(p.getId()).append("] ")
                    .append(p.getTitle())
                    .append(" | post date: ")
                    .append(p.getCreatedAt() == null ? "date unavailable" : p.getCreatedAt().toLocalDate())
                    .append(" | tags: ").append(p.getTags() == null ? "" : p.getTags())
                    .append(" | ").append(snippet)
                    .append("\n");
        }

        String prompt = """
                You help students find posts on a university blog. The post catalog is below.
                Pick up to 5 posts that best match the user's need.
                Today's date is %s.
                Use each post's published date when making recommendations:
                - If the user asks for the latest, newest, recent, upcoming, or time-sensitive information,
                  prioritize the most recently published relevant posts and explain the date context.
                  For "latest announcements", choose the newest relevant posts first.
                - For other requests, prioritize relevance first and use recency to break close matches.
                Never recommend a post that is missing from the catalog.
                - Never describe an old post as upcoming or current unless its content and date support that.
                - Do not invent dates, deadlines, or facts that are not in the catalog.
                Reply in English with 1-2 short sentences explaining the choice. Plain text, no markdown.
                On the LAST line write exactly: IDS: followed by the chosen post ids separated by commas
                (example: IDS: 3,7). If nothing matches write: IDS: NONE
                Only use ids that appear in the catalog. Never invent ids.

                Catalog:
                %s

                Conversation so far:
                %s

                User need: %s
                """.formatted(LocalDate.now(), catalog, formatHistory(req.history()), req.message());

        String raw = aiService.generate(prompt);

        String reply = raw;
        List<ChatResponse.PostHit> hits = new ArrayList<>();
        Matcher m = IDS_LINE.matcher(raw);
        if (m.find()) {
            reply = raw.substring(0, m.start()).trim();
            for (String part : m.group(1).split("[,\\s]+")) {
                try {
                    Post p = byId.get(Long.parseLong(part.trim()));
                    if (p != null) hits.add(new ChatResponse.PostHit(p.getId(), p.getTitle()));
                } catch (NumberFormatException ignored) {
                    // Ignore "NONE" or any unrecognized value
                }
            }
        }
        if (reply.isBlank()) reply = hits.isEmpty() ? "I couldn't find any matching posts." : "Here are some matching posts:";

        return new ChatResponse(reply, hits);
    }

    private String formatHistory(List<ChatRequest.Turn> history) {
        if (history == null || history.isEmpty()) return "(none)";
        int from = Math.max(0, history.size() - 6);
        return history.subList(from, history.size()).stream()
                .map(t -> ("user".equals(t.role()) ? "User: " : "Assistant: ") + t.text())
                .collect(Collectors.joining("\n"));
    }
}