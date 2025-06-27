package com.skincare.backend.domain.dto.scan;

import org.springframework.web.multipart.MultipartFile;

public class ScanCreateDto {
    private Long userId;
    private String resultSummary;
    private MultipartFile image;
    private String ingredientInfoJson;
    private String recommendationsJson;
    private String productSafety;
}
