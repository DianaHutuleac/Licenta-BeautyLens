package com.skincare.backend.controller;

import com.skincare.backend.service.UserDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserDataService userDataService;

    public UserController(UserDataService userDataService) {
        this.userDataService = userDataService;
    }

    @PutMapping("/{id}/skin-type")
    public ResponseEntity<String> updateSkinType(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String skinType = body.get("skinType");
        userDataService.updateSkinType(id, skinType);
        return ResponseEntity.ok("Skin type updated");
    }

    @PostMapping("/{id}/upload-profile-picture")
    public ResponseEntity<String> uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String imageUrl = userDataService.storeProfilePicture(id, file);
        return ResponseEntity.ok(imageUrl);
    }
}
