package com.example.demo.users.controller;

import com.example.demo.users.dto.request.ChangePasswordRequest;
import com.example.demo.users.dto.request.ResetPasswordRequest;
import com.example.demo.users.dto.request.UserRequest;
import com.example.demo.users.dto.response.UserResponse;
import com.example.demo.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --- CREATE ---
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid UserRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- READ ALL ---
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> responses = userService.getAllUsers();
        return ResponseEntity.ok(responses);
    }

    // --- READ BY ID ---
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // --- UPDATE ---
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id,
            @RequestBody @Valid UserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    // --- DELETE (Hard Delete - Xóa vĩnh viễn) ---
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    // --- ACTIVATE USER ---
    @PutMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable String id) {
        UserResponse response = userService.activateUser(id);
        return ResponseEntity.ok(response);
    }

    // --- BLOCK USER ---
    @PutMapping("/{id}/block")
    public ResponseEntity<UserResponse> blockUser(@PathVariable String id) {
        UserResponse response = userService.blockUser(id);
        return ResponseEntity.ok(response);
    }

    // --- UNBLOCK USER ---
    @PutMapping("/{id}/unblock")
    public ResponseEntity<UserResponse> unblockUser(@PathVariable String id) {
        UserResponse response = userService.unblockUser(id);
        return ResponseEntity.ok(response);
    }

    // --- RESET PASSWORD (Admin) ---
    @PutMapping("/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable String id,
            @RequestBody @Valid ResetPasswordRequest request) {
        userService.resetPassword(id, request);
    }

    // --- CHANGE PASSWORD (User) ---
    @PutMapping("/me/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ChangePasswordRequest request) {
        // Get current user by email from JWT
        UserResponse currentUser = userService.getCurrentUser(userDetails.getUsername());
        userService.changePassword(currentUser.getId(), request);
    }

    // --- GET CURRENT USER ---
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

}