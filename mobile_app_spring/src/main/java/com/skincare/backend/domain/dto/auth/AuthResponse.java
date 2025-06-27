package com.skincare.backend.domain.dto.auth;

import com.skincare.backend.domain.dto.user.UserGetDto;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
public class  AuthResponse {
    private String token;
    private UserGetDto user;

    public AuthResponse(String token, UserGetDto user) {
        this.token = token;
        this.user = user;
    }
}
