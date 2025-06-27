package com.skincare.backend.repository;

import com.skincare.backend.domain.entity.ExplorePost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExplorePostRepository extends JpaRepository<ExplorePost, Long> {
    List<ExplorePost> findAllByOrderByCreatedAtDesc();
    List<ExplorePost> findAllByOrderByCreatedAtAsc();
}

