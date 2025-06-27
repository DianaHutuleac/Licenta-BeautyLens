package com.skincare.backend.service;

import com.skincare.backend.domain.dto.explore.ExploreCommentDto;
import com.skincare.backend.domain.entity.ExploreComment;
import com.skincare.backend.domain.entity.ExplorePost;
import com.skincare.backend.domain.entity.UserData;
import com.skincare.backend.mapper.ExploreCommentMapper;
import com.skincare.backend.repository.ExploreCommentRepository;
import com.skincare.backend.repository.ExplorePostRepository;
import com.skincare.backend.repository.UserDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExploreCommentService {
    private final ExploreCommentRepository commentRepo;
    private final ExplorePostRepository postRepo;
    private final UserDataRepository userRepo;
    private final ExploreCommentMapper mapper;

    public ExploreCommentDto addComment(Long postId, Long userId, String content) {
        ExplorePost post = postRepo.findById(postId).orElseThrow();
        UserData user = userRepo.findById(userId).orElseThrow();

        ExploreComment comment = ExploreComment.builder()
                .content(content)
                .user(user)
                .post(post)
                .createdAt(LocalDateTime.now())
                .build();

        return mapper.toDto(commentRepo.save(comment));
    }

    public List<ExploreCommentDto> getCommentsForPost(Long postId) {
        return mapper.toDtoList(commentRepo.findByPostIdOrderByCreatedAtDesc(postId));
    }
}
