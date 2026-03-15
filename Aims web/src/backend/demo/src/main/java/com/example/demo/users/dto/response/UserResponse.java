package com.example.demo.users.dto.response;

import com.example.demo.users.enums.Role;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private LocalDate createdAt;
}