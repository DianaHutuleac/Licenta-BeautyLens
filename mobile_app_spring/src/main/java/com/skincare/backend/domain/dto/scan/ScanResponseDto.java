package com.skincare.backend.domain.dto.scan;

import java.time.LocalDateTime;

public record ScanResponseDto(
        Long id,
        String imagePath,
        String resultSummary,
        String ingredientInfoJson,
        String recommendationsJson,
        com.skincare.backend.domain.enums.ProductSafety productSafety, LocalDateTime scannedAt
) {}
