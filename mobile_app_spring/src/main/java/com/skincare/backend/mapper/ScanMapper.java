package com.skincare.backend.mapper;

import com.skincare.backend.domain.dto.scan.ScanResponseDto;
import com.skincare.backend.domain.entity.Scan;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ScanMapper {
    default ScanResponseDto toDto(Scan scan) {
        return new ScanResponseDto(
                scan.getId(),
                scan.getImagePath(),
                scan.getResultSummary(),
                scan.getIngredientInfoJson(),
                scan.getRecommendationsJson(),
                scan.getProductSafety(),
                scan.getScannedAt()
        );
    }

    default List<ScanResponseDto> toDtoList(List<Scan> scans) {
        return scans.stream().map(this::toDto).toList();
    }
}
