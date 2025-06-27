package com.skincare.backend.controller;

import com.skincare.backend.domain.dto.auth.AuthResponse;
import com.skincare.backend.domain.dto.user.UserCreateDto;
import com.skincare.backend.domain.dto.user.UserLogInDto;
import com.skincare.backend.service.UserDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserDataService userDataService;

    public AuthController(UserDataService userDataService) {
        this.userDataService = userDataService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody UserCreateDto userCreateDto) {
        AuthResponse authResponse = userDataService.registerUser(userCreateDto);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody UserLogInDto userLogInDto) {
        AuthResponse authResponse = userDataService.loginUser(userLogInDto);
        return ResponseEntity.ok(authResponse);
    }
}
