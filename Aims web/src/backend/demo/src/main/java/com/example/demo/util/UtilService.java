package com.example.demo.util;

import com.example.demo.users.dto.response.UserResponse;

/**
 * Interface for utility services providing common helper functions.
 */
public interface UtilService {

    /**
     * Get user name from JWT token
     * 
     * @param token JWT token (with or without "Bearer " prefix)
     * @return User's name
     */
    String getNameFromToken(String token);

    /**
     * Get user ID from JWT token
     * 
     * @param token JWT token (with or without "Bearer " prefix)
     * @return User's ID
     */
    String getIdFromToken(String token);

    /**
     * Get user email from JWT token
     * 
     * @param token JWT token (with or without "Bearer " prefix)
     * @return User's email
     */
    String getEmailFromToken(String token);

    /**
     * Get user role from JWT token
     * 
     * @param token JWT token (with or without "Bearer " prefix)
     * @return User's role
     */
    String getRoleFromToken(String token);

    /**
     * Get full user info from JWT token
     * 
     * @param token JWT token (with or without "Bearer " prefix)
     * @return UserResponse with full user information
     */
    UserResponse getUserFromToken(String token);

    /**
     * Validate if token is valid and not expired
     * 
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    boolean isTokenValid(String token);
}
