package com.example.demo.util.impl;

import com.example.demo.auths.security.JwtService;
import com.example.demo.users.dto.response.UserResponse;
import com.example.demo.users.entity.User;
import com.example.demo.users.repository.UserRepository;
import com.example.demo.util.UtilService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementation of UtilService providing common utility functions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UtilServiceImpl implements UtilService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    /**
     * Clean token by removing "Bearer " prefix if present
     */
    private String cleanToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    /**
     * Get User entity from token
     */
    private User getUserEntityFromToken(String token) {
        String cleanedToken = cleanToken(token);
        String email = jwtService.extractUsername(cleanedToken);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với email: " + email));
    }

    @Override
    public String getNameFromToken(String token) {
        try {
            User user = getUserEntityFromToken(token);
            log.debug("Got name from token: {}", user.getName());
            return user.getName();
        } catch (Exception e) {
            log.error("Failed to get name from token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy tên từ token: " + e.getMessage());
        }
    }

    @Override
    public String getIdFromToken(String token) {
        try {
            User user = getUserEntityFromToken(token);
            log.debug("Got ID from token: {}", user.getId());
            return user.getId();
        } catch (Exception e) {
            log.error("Failed to get ID from token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy ID từ token: " + e.getMessage());
        }
    }

    @Override
    public String getEmailFromToken(String token) {
        try {
            String cleanedToken = cleanToken(token);
            String email = jwtService.extractUsername(cleanedToken);
            log.debug("Got email from token: {}", email);
            return email;
        } catch (Exception e) {
            log.error("Failed to get email from token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy email từ token: " + e.getMessage());
        }
    }

    @Override
    public String getRoleFromToken(String token) {
        try {
            User user = getUserEntityFromToken(token);
            String role = user.getRole().name();
            log.debug("Got role from token: {}", role);
            return role;
        } catch (Exception e) {
            log.error("Failed to get role from token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy role từ token: " + e.getMessage());
        }
    }

    @Override
    public UserResponse getUserFromToken(String token) {
        try {
            User user = getUserEntityFromToken(token);
            log.debug("Got user from token: {}", user.getEmail());

            UserResponse response = new UserResponse();
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setActive(user.isActive());
            response.setCreatedAt(user.getCreatedAt());
            return response;
        } catch (Exception e) {
            log.error("Failed to get user from token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy thông tin user từ token: " + e.getMessage());
        }
    }

    @Override
    public boolean isTokenValid(String token) {
        try {
            String cleanedToken = cleanToken(token);
            String email = jwtService.extractUsername(cleanedToken);

            // Check if user exists
            if (!userRepository.existsByEmail(email)) {
                log.warn("Token validation failed: user not found for email {}", email);
                return false;
            }

            log.debug("Token is valid for user: {}", email);
            return true;
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}
