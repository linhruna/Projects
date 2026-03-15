package com.example.demo.users.service;

import com.example.demo.users.dto.request.ChangePasswordRequest;
import com.example.demo.users.dto.request.ResetPasswordRequest;
import com.example.demo.users.dto.request.UserRequest;
import com.example.demo.users.dto.response.UserResponse;

import java.util.List;

/**
 * Interface cho các nghiệp vụ liên quan đến User.
 */
public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(String id);

    UserResponse updateUser(String id, UserRequest request);

    void deactivateUser(String id);

    // Hard delete - permanently removes user from database
    void deleteUser(String id);

    // New methods for user management
    UserResponse activateUser(String id);

    UserResponse blockUser(String id);

    UserResponse unblockUser(String id);

    void resetPassword(String id, ResetPasswordRequest request);

    void changePassword(String id, ChangePasswordRequest request);

    UserResponse getCurrentUser(String email);
}