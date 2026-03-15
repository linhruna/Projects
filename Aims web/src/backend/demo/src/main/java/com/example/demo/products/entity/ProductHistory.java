package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_history")
public class ProductHistory {

    @Id
    private String id;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "action")
    private String action; // ADD, EDIT, DELETE, DEACTIVATE

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "details", length = 1000)
    private String details; // Optional: store additional details about the change
}

