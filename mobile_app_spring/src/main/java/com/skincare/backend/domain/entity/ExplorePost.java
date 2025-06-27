package com.skincare.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplorePost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String resultSummary;

    @Column(columnDefinition = "TEXT")
    private String ingredientInfoJson;

    @Column(columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(nullable = false)
    private int likesCount = 0;

    @ElementCollection
    private Set<Long> likedBy = new HashSet<>();

    private LocalDateTime createdAt;

    @ManyToOne
    private UserData user;
}
