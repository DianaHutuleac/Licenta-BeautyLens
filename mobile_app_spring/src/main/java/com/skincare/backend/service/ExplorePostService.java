package com.skincare.backend.service;

import com.skincare.backend.domain.dto.explore.ExplorePostDto;
import com.skincare.backend.domain.entity.ExplorePost;
import com.skincare.backend.domain.entity.UserData;
import com.skincare.backend.mapper.ExplorePostMapper;
import com.skincare.backend.repository.ExploreCommentRepository;
import com.skincare.backend.repository.ExplorePostRepository;
import com.skincare.backend.repository.UserDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExplorePostService {
    private final ExplorePostRepository repository;
    private final UserDataRepository userRepo;
    private final ExplorePostMapper mapper;
    private final ExploreCommentRepository commentRepo;

    public ExplorePostDto createPost(Long userId, String description, String imageUrl,
                                     String resultSummary, String ingredientInfoJson, String recommendationsJson) {
        UserData user = userRepo.findById(userId).orElseThrow();
        ExplorePost post = ExplorePost.builder()
                .user(user)
                .description(description)
                .imageUrl(imageUrl)
                .resultSummary(resultSummary)
                .ingredientInfoJson(ingredientInfoJson)
                .recommendationsJson(recommendationsJson)
                .createdAt(LocalDateTime.now())
                .build();
        return mapper.toDto(repository.save(post));
    }

    public List<ExplorePostDto> getAllPosts() {
        List<ExplorePost> posts = repository.findAllByOrderByCreatedAtDesc();
        List<ExplorePostDto> dtos = mapper.toDtoList(posts);

        for (int i = 0; i < posts.size(); i++) {
            Long postId = posts.get(i).getId();
            int count = commentRepo.countByPostId(postId);
            dtos.get(i).setCommentsCount(count);
        }

        return dtos;
    }

    public void incrementLikes(Long postId) {
        ExplorePost post = repository.findById(postId).orElseThrow();
        post.setLikesCount(post.getLikesCount() + 1);
        repository.save(post);
    }

    public void toggleLike(Long postId, Long userId) {
        ExplorePost post = repository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getLikedBy().contains(userId)) {
            post.setLikesCount(post.getLikesCount() - 1);
            post.getLikedBy().remove(userId);
        } else {
            post.setLikesCount(post.getLikesCount() + 1);
            post.getLikedBy().add(userId);
        }

        repository.save(post);
    }

    public List<ExplorePostDto> getPostsSortedByRecent() {
        return mapper.toDtoList(repository.findAllByOrderByCreatedAtDesc());
    }

    public List<ExplorePostDto> getPostsSortedByOldest() {
        return mapper.toDtoList(repository.findAllByOrderByCreatedAtAsc());
    }
}
