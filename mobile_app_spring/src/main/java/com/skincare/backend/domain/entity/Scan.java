package com.skincare.backend.domain.entity;

import com.skincare.backend.domain.enums.ProductSafety;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Scan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imagePath;
    @Column(columnDefinition = "TEXT")
    private String resultSummary;
    private LocalDateTime scannedAt;

    @Column(columnDefinition = "TEXT")
    private String ingredientInfoJson;
    @Column(columnDefinition = "TEXT")
    private String recommendationsJson;
    @Enumerated(EnumType.STRING)
    private ProductSafety productSafety;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserData user;

}

