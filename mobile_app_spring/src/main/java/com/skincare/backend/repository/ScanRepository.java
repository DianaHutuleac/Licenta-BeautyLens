package com.skincare.backend.repository;

import com.skincare.backend.domain.entity.Scan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanRepository extends JpaRepository<Scan, Long> {
    List<Scan> findByUserId(Long userId);
    List<Scan> findByUserIdOrderByScannedAtDesc(Long userId);
    List<Scan> findByUserIdOrderByScannedAtAsc(Long userId);
}
