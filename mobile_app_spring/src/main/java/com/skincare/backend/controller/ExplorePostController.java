package com.skincare.backend.controller;

import com.skincare.backend.domain.dto.explore.ExplorePostDto;
import com.skincare.backend.service.ExplorePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/explore")
@RequiredArgsConstructor
public class ExplorePostController {
    private final ExplorePostService explorePostService;


    @PostMapping("/post")
    public ResponseEntity<ExplorePostDto> shareScan(@RequestBody Map<String, String> body) {
        Long userId = Long.parseLong(body.get("userId"));
        return ResponseEntity.ok(explorePostService.createPost(
                userId,
                body.get("description"),
                body.get("imageUrl"),
                body.get("resultSummary"),
                body.get("ingredientInfoJson"),
                body.get("recommendationsJson")
        ));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<ExplorePostDto>> getExplorePosts(
            @RequestParam(defaultValue = "recent") String sort
    ) {
        if (sort.equalsIgnoreCase("oldest")) {
            return ResponseEntity.ok(explorePostService.getPostsSortedByOldest());
        } else {
            return ResponseEntity.ok(explorePostService.getPostsSortedByRecent());
        }
    }

    @PatchMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        explorePostService.toggleLike(id, userId);
        return ResponseEntity.ok().build();
    }


}
