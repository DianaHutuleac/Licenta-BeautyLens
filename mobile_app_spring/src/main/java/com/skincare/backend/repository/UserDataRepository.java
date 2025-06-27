package com.skincare.backend.repository;


import com.skincare.backend.domain.entity.UserData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserDataRepository extends JpaRepository<UserData, Long> {
    Optional<UserData> findUserDataByEmail(String email);
}
