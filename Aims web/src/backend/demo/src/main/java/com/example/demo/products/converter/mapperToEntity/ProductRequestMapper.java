package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductRequestMapper {

    private final List<ProductSpecificMapper> specificMappers;

    // For create: set originalValue if missing
    public void mapCommonFields(Product p, ProductRequestDTO dto) {
        p.setTitle(dto.getTitle());
        p.setCategory(dto.getCategory());
        Long originalValue = dto.getOriginalValue();
        if (originalValue == null || originalValue <= 0) {
            originalValue = dto.getCurrentPrice();
        }
        p.setOriginalValue(originalValue);
        p.setCurrentPrice(dto.getCurrentPrice());
        p.setQuantity(dto.getQuantity());
        p.setImageURL(dto.getImageURL());
        p.setCreatedBy(dto.getCreatedBy());
        p.setWeight(dto.getWeight());
    }

    // For update: don't change originalValue
    public void mapCommonFieldsForUpdate(Product p, ProductRequestDTO dto) {
        p.setTitle(dto.getTitle());
        p.setCategory(dto.getCategory());
        p.setCurrentPrice(dto.getCurrentPrice());
        p.setQuantity(dto.getQuantity());
        p.setImageURL(dto.getImageURL());
        p.setCreatedBy(dto.getCreatedBy());
        p.setWeight(dto.getWeight());
    }

    // Delegate product-specific request -> entity mapping to registered mappers
    public void mapSpecificFields(Product p, ProductRequestDTO dto) {
        specificMappers.stream()
                .filter(m -> m.supports(p))
                .findFirst()
                .ifPresent(m -> m.map(p, dto));
    }
}