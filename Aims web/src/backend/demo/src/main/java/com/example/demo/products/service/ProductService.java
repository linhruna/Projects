package com.example.demo.products.service;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.dto.response.ProductResponseDTO;

import java.util.List;

public interface ProductService {

    ProductResponseDTO create(ProductRequestDTO dto);

    ProductResponseDTO get(String id);

    ProductResponseDTO update(String id, ProductRequestDTO dto);

    void delete(String id);

    List<ProductResponseDTO> list(String type);

    List<ProductResponseDTO> getProductsByCategory(String category);

    List<ProductResponseDTO> getProductsByAuthor(String authorId);

    List<ProductResponseDTO> getProductsBySection(String sectionId);

}
