package com.skincare.backend.domain.dto.user;

import com.skincare.backend.domain.enums.Gender;
import com.skincare.backend.domain.enums.SkinType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserGetDto {
    private Long id;
    private String firstName;
    private String lastName;
    private Gender gender;
    private Integer age;
    private String email;
    private SkinType skinType;
    private String profilePictureUrl;
}
