package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Product;

public interface ProductSpecificMapper {
    boolean supports(Product p);
    void map(Product p, ProductRequestDTO dto);
}
