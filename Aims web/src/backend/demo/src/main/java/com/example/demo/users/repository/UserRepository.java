package com.example.demo.users.repository;

import com.example.demo.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Thêm phương thức tìm kiếm theo email (hữu ích cho việc kiểm tra email trùng lặp/login)
    Optional<User> findByEmail(String email);

    // Thêm phương thức kiểm tra email đã tồn tại hay chưa
    boolean existsByEmail(String email);
}
