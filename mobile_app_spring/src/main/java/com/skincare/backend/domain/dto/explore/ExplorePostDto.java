package com.skincare.backend.domain.dto.explore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplorePostDto {
    private Long id;
    private String userName;
    private Integer age;
    private String gender;
    private String profilePictureUrl;
    private String description;
    private String imageUrl;
    private String resultSummary;
    private String ingredientInfoJson;
    private String recommendationsJson;
    private int likesCount;
    private List<Long> likedBy;
    private int commentsCount;
    private LocalDateTime createdAt;
}

