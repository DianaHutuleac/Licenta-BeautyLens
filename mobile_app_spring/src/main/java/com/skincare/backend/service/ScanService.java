package com.skincare.backend.service;

import com.skincare.backend.domain.dto.scan.ScanResponseDto;
import com.skincare.backend.domain.entity.Scan;
import com.skincare.backend.domain.entity.UserData;
import com.skincare.backend.domain.enums.ProductSafety;
import com.skincare.backend.mapper.ScanMapper;
import com.skincare.backend.repository.ScanRepository;
import com.skincare.backend.repository.UserDataRepository;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ScanService {

    private final ScanRepository scanRepository;
    private final UserDataRepository userDataRepository;
    private final ScanMapper scanMapper;

    public Scan saveScan(Long userId, String imagePath, String resultSummary, String ingredientInfoJson, String recommendationsJson, ProductSafety productSafety) throws IOException {
        UserData user = userDataRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Scan scan = Scan.builder()
                .user(user)
                .imagePath(imagePath)
                .resultSummary(resultSummary)
                .ingredientInfoJson(ingredientInfoJson)
                .recommendationsJson(recommendationsJson)
                .productSafety(productSafety)
                .scannedAt(LocalDateTime.now())
                .build();

        return scanRepository.save(scan);
    }

    public List<ScanResponseDto> getScansByUser(Long userId, String sort) {
        List<Scan> scans;
        if ("oldest".equalsIgnoreCase(sort)) {
            scans = scanRepository.findByUserIdOrderByScannedAtAsc(userId);
        } else {
            scans = scanRepository.findByUserIdOrderByScannedAtDesc(userId);
        }
        return scanMapper.toDtoList(scans);
    }


    public String saveImageToDisk(MultipartFile file) throws IOException {
        String uploadDir = "uploads";
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public Map<String, Integer> aggregateUserSafetyCounts(Long userId) {
        List<Scan> scans = scanRepository.findByUserId(userId)
                .stream()
                .filter(scan -> scan.getProductSafety() != null)
                .collect(Collectors.toList());
        Map<String, Integer> counts = new HashMap<>();

        counts.put("safe", 0);
        counts.put("harmful", 0);
        counts.put("neutral", 0);
        counts.put("unknown", 0);

        ObjectMapper mapper = new ObjectMapper();

        for (Scan scan : scans) {
            try {
                JsonNode root = mapper.readTree(scan.getIngredientInfoJson());
                JsonNode ingredients = root.get("ingredients");

                if (ingredients != null && ingredients.isArray()) {
                    for (JsonNode ingredient : ingredients) {
                        String safety = ingredient.has("safety")
                                ? ingredient.get("safety").asText().toLowerCase()
                                : "unknown";

                        if (safety.contains("harmful") || safety.contains("irritation")) {
                            counts.put("harmful", counts.get("harmful") + 1);
                        } else if (safety.contains("safe")) {
                            counts.put("safe", counts.get("safe") + 1);
                        } else if (safety.contains("neutral")) {
                            counts.put("neutral", counts.get("neutral") + 1);
                        } else {
                            counts.put("unknown", counts.get("unknown") + 1);
                        }
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return counts;
    }

    public Map<String, Integer> aggregateUserProductLabels(Long userId) {
        List<Scan> scans = scanRepository.findByUserId(userId);
        Map<String, Integer> counts = new HashMap<>();

        counts.put("safe", 0);
        counts.put("harmful", 0);
        counts.put("neutral", 0);
        counts.put("unknown", 0);

        for (Scan scan : scans) {
            ProductSafety safety = scan.getProductSafety();
            if (safety != null) {
                String label = safety.name().toLowerCase();
                counts.put(label, counts.get(label) + 1);
            } else {
                counts.put("unknown", counts.get("unknown") + 1);
            }
        }

        return counts;
    }



}
