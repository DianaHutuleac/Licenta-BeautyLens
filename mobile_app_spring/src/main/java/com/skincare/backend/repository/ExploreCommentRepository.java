package com.skincare.backend.repository;

import com.skincare.backend.domain.entity.ExploreComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExploreCommentRepository extends JpaRepository<ExploreComment, Long> {
    List<ExploreComment> findByPostIdOrderByCreatedAtDesc(Long postId);
    int countByPostId(Long postId);

}
