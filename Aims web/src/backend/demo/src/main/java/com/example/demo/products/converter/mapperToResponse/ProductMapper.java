package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.ProductResponseDTO;
import com.example.demo.products.entity.Product;

public interface ProductMapper {
    boolean supports(Product product);
    ProductResponseDTO toResponse(Product product);
}