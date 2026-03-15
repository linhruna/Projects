package com.example.demo.products.dto.response;

import lombok.Data;

@Data
public abstract class ProductResponseDTO {
    private String id;
    private String category;
    private String title;
    private Long originalValue;
    private Long currentPrice;
    private Integer quantity;
    private String imageURL;
    private Double weight; // Trọng lượng sản phẩm (kg)
}