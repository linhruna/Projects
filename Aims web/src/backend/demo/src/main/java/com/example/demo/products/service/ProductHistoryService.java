package com.example.demo.products.service;

import com.example.demo.products.dto.request.ProductHistoryRequestDTO;
import com.example.demo.products.dto.response.ProductHistoryResponseDTO;

import java.util.List;

public interface ProductHistoryService {
    ProductHistoryResponseDTO create(ProductHistoryRequestDTO dto);
    List<ProductHistoryResponseDTO> getAll();
    List<ProductHistoryResponseDTO> getByProductId(String productId);
    void deleteAll();
}

