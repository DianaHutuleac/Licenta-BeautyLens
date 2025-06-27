package com.skincare.backend.domain.dto.explore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExploreCommentDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String userName;
    private String profilePictureUrl;
}
