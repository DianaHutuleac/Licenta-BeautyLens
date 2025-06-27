package com.skincare.backend.controller;

import com.skincare.backend.domain.dto.explore.ExploreCommentDto;
import com.skincare.backend.service.ExploreCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/explore/comments")
@RequiredArgsConstructor
public class ExploreCommentController {
    private final ExploreCommentService service;

    @PostMapping("/add")
    public ResponseEntity<ExploreCommentDto> addComment(@RequestBody Map<String, String> body) {
        Long userId = Long.parseLong(body.get("userId"));
        Long postId = Long.parseLong(body.get("postId"));
        String content = body.get("content");
        return ResponseEntity.ok(service.addComment(postId, userId, content));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<ExploreCommentDto>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(service.getCommentsForPost(postId));
    }
}
