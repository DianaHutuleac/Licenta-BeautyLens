package com.skincare.backend.service.impl;


import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.skincare.backend.domain.dto.auth.AuthResponse;
import com.skincare.backend.domain.dto.user.UserCreateDto;
import com.skincare.backend.domain.dto.user.UserGetDto;
import com.skincare.backend.domain.dto.user.UserLogInDto;
import com.skincare.backend.domain.entity.UserData;
import com.skincare.backend.domain.enums.SkinType;
import com.skincare.backend.exception.UserNotFoundException;
import com.skincare.backend.exception.UserPasswordIncorrectException;
import com.skincare.backend.mapper.UserDataMapper;
import com.skincare.backend.repository.UserDataRepository;
import com.skincare.backend.service.UserDataService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.UUID;

@Service
public class UserDataServiceImpl implements UserDataService {

    private static final String SECRET_KEY = "MY_SUPER_SECRET_KEY_123456";
    private final UserDataRepository userDataRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataServiceImpl(UserDataRepository userDataRepository,
                               PasswordEncoder passwordEncoder) {
        this.userDataRepository = userDataRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponse registerUser(UserCreateDto userCreateDto) {
        UserData user = UserDataMapper.INSTANCE.userCreateDtoToUserData(userCreateDto);

        String hashedPassword = passwordEncoder.encode(userCreateDto.getPassword());
        user.setPassword(hashedPassword);
        user.setRole("ROLE_USER");

        UserData savedUser = userDataRepository.save(user);

        String token = generateJwtToken(savedUser);

        UserGetDto userGetDto = UserDataMapper.INSTANCE.userToUserGetDto(savedUser);

        return new AuthResponse(token, userGetDto);
    }

    @Override
    public AuthResponse loginUser(UserLogInDto userLogInDto) {
        UserData user = userDataRepository.findUserDataByEmail(userLogInDto.getEmail())
                .orElseThrow(() -> new UserNotFoundException(
                        "Cannot find user with email " + userLogInDto.getEmail()
                ));

        if (!passwordEncoder.matches(userLogInDto.getPassword(), user.getPassword())) {
            throw new UserPasswordIncorrectException("Incorrect password for " + userLogInDto.getEmail());
        }

        String token = generateJwtToken(user);

        UserGetDto userGetDto = UserDataMapper.INSTANCE.userToUserGetDto(user);

        return new AuthResponse(token, userGetDto);
    }

    @Override
    public void updateSkinType(Long userId, String skinTypeStr) {
        UserData user = userDataRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        SkinType skinType = SkinType.valueOf(skinTypeStr.toUpperCase());
        user.setSkinType(skinType);
        userDataRepository.save(user);
    }

    @Override
    public String storeProfilePicture(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        UserData user = userDataRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/profile_pics");

            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/uploads/profile_pics/" + filename;
            user.setProfilePictureUrl(imageUrl);
            userDataRepository.save(user);
            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile picture", e);
        }
    }

    private String generateJwtToken(UserData user) {
        return JWT.create()
                .withSubject(String.valueOf(user.getId()))
                .withClaim("email", user.getEmail())
                .withClaim("role", user.getRole())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86_400_000))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

}
