package com.example.demo.products.dto.request;

import lombok.Data;

@Data
public class ProductHistoryRequestDTO {
    private String productId;
    private String productName;
    private String action; // ADD, EDIT, DELETE, DEACTIVATE
    private String userName;
    private String details;
}

