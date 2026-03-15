package com.example.demo.products.factory;


import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Product;

public interface ProductFactory {
    String getCategory();
    Product create(ProductRequestDTO dto);
}