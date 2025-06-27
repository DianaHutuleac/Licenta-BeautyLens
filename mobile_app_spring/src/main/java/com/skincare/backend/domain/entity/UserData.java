package com.skincare.backend.domain.entity;

import com.skincare.backend.domain.enums.Gender;
import com.skincare.backend.domain.enums.SkinType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class UserData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    private SkinType skinType;

    private String email;

    private String password;

    private String role;
    @Column(columnDefinition = "TEXT")
    private String profilePictureUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private java.util.List<Scan> scans = new ArrayList<>();


}
