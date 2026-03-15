package com.example.demo.users.entity;

import com.example.demo.users.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private LocalDate createdAt;

    private String createdBy;
    private boolean active = true;
}
