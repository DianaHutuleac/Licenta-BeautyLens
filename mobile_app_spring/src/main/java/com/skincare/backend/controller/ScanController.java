package com.skincare.backend.controller;

import com.skincare.backend.domain.dto.scan.ScanResponseDto;
import com.skincare.backend.domain.entity.Scan;
import com.skincare.backend.domain.enums.ProductSafety;
import com.skincare.backend.mapper.ScanMapper;
import com.skincare.backend.service.ScanService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scans")
public class ScanController {

    private final ScanService scanService;
    private final ScanMapper scanMapper;

    public ScanController(ScanService scanService, ScanMapper scanMapper) {
        this.scanService = scanService;
        this.scanMapper = scanMapper;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ScanResponseDto> uploadScan(
            @RequestParam("userId") Long userId,
            @RequestParam("resultSummary") String resultSummary,
            @RequestParam("ingredientInfoJson") String ingredientInfoJson,
            @RequestParam("recommendationsJson") String recommendationsJson,
            @RequestParam("productSafety") String productSafetyRaw,
            @RequestPart("image") MultipartFile imageFile
    ) throws IOException {
        System.out.println("[DEBUG] Uploading scan with productSafety = " + productSafetyRaw);

        String fileName = scanService.saveImageToDisk(imageFile);
        ProductSafety productSafety = ProductSafety.valueOf(productSafetyRaw.toUpperCase());


        Scan scan = scanService.saveScan(
                userId,
                fileName,
                resultSummary,
                ingredientInfoJson,
                recommendationsJson,
                productSafety
        );

        ScanResponseDto dto = scanMapper.toDto(scan);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ScanResponseDto>> getUserScans(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "recent") String sort
    ) {
        List<ScanResponseDto> scans = scanService.getScansByUser(userId, sort);
        return ResponseEntity.ok(scans);
    }


    @GetMapping("/user/{userId}/safety-summary")
    public ResponseEntity<Map<String, Integer>> getSafetySummary(@PathVariable Long userId) {
        Map<String, Integer> summary = scanService.aggregateUserSafetyCounts(userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}/product-label-summary")
    public ResponseEntity<Map<String, Integer>> getProductLabelSummary(@PathVariable Long userId) {
        Map<String, Integer> summary = scanService.aggregateUserProductLabels(userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}/product-summary")
    public ResponseEntity<Map<String, Integer>> getProductSummary(@PathVariable Long userId) {
        Map<String, Integer> summary = scanService.aggregateUserProductLabels(userId);
        return ResponseEntity.ok(summary);
    }


}
