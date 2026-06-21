package com.auction.api.service;

import com.auction.api.dto.*;
import com.auction.api.entity.Role;
import com.auction.api.entity.User;
import com.auction.api.repository.UserRepository;
import com.auction.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        return new AuthResponse(token, mapToUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getSuspended()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account suspended");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, mapToUserResponse(user));
    }

    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setName(request.getName().trim());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (request.getPassword().length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
