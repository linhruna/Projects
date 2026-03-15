package com.example.demo.products.factory;

import org.springframework.stereotype.Component;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Product;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class ProductFactoryRegistry {
    private final Map<String, ProductFactory> factories;

    public ProductFactoryRegistry(List<ProductFactory> factoryList) {
        this.factories = factoryList.stream()
                .collect(Collectors.toMap(
                        f -> f.getCategory().toUpperCase(Locale.ENGLISH),
                        f -> f,
                        (existing, replacement) -> existing
                ));
    }

    public Product create(ProductRequestDTO dto) {
        String key = dto.getCategory() == null ? "" : dto.getCategory().toUpperCase(Locale.ENGLISH);
        ProductFactory factory = factories.get(key);
        if (factory == null) {
            throw new IllegalArgumentException("Invalid product type: " + dto.getCategory());
        }
        return factory.create(dto);
    }
}