package com.example.demo.users.dto.request;

import com.example.demo.users.enums.Role;
import lombok.Data;
@Data
public class UserRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
