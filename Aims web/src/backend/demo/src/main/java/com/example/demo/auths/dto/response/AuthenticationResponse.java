package com.example.demo.auths.dto.response;

import lombok.Data;

@Data


public class AuthenticationResponse {
    private String token;
    private String name;     // Trả về thêm tên để hiển thị lên UI
    private String role;     // Trả về role để UI điều hướng (Admin/Home)
}