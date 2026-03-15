package com.example.demo.products.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductHistoryResponseDTO {
    private String id;
    private String productId;
    private String productName;
    private String action;
    private LocalDateTime timestamp;
    private String userName;
    private String details;
}

