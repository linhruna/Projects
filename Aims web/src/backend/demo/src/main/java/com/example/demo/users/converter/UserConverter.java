package com.example.demo.users.converter;
import com.example.demo.users.dto.request.UserRequest;
import com.example.demo.users.dto.response.UserResponse;
import com.example.demo.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserConverter {

    // Chuyển từ Entity sang Response DTO
    public UserResponse toResponse(User entity) {
        if (entity == null) {
            return null;
        }
        UserResponse response = new UserResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setEmail(entity.getEmail());
        response.setRole(entity.getRole());
        response.setActive(entity.isActive());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }

    // Chuyển từ Request DTO sang Entity (dùng cho Create/Update)
    public User toEntity(UserRequest request) {
        if (request == null) {
            return null;
        }
        User entity = new User();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        // Mật khẩu sẽ được mã hóa trong Service
        entity.setPassword(request.getPassword());
        entity.setRole(request.getRole());
        return entity;
    }

    // Cập nhật Entity từ Request DTO
    public User toEntity(User entity, UserRequest request) {
        if (entity == null || request == null) {
            return entity;
        }
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        // Mật khẩu sẽ được mã hóa trong Service (nếu request.getPassword() khác null/empty)
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            entity.setPassword(request.getPassword());
        }
        entity.setRole(request.getRole());
        return entity;
    }
}