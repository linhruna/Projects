package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.ProductResponseDTO;
import com.example.demo.products.entity.Product;

public abstract class AbstractProductMapper<T extends Product, D extends ProductResponseDTO>
        implements ProductMapper {

    private final Class<T> type;

    protected AbstractProductMapper(Class<T> type) {
        this.type = type;
    }

    @Override
    public boolean supports(Product product) {
        return type.isInstance(product);
    }

    @Override
    public ProductResponseDTO toResponse(Product product) {
        if (product == null)
            return null;
        T p = type.cast(product);
        D dto = createDto();
        mapSpecificFields(p, dto);
        mapCommonFields(p, dto);
        return dto;
    }

    protected void mapCommonFields(T product, D dto) {
        dto.setId(product.getId());
        dto.setCategory(product.getClass().getSimpleName().toUpperCase());
        dto.setTitle(product.getTitle());
        dto.setCategory(product.getCategory());
        dto.setOriginalValue(product.getOriginalValue());
        dto.setCurrentPrice(product.getCurrentPrice());
        dto.setQuantity(product.getQuantity());
        dto.setImageURL(product.getImageURL());
        dto.setWeight(product.getWeight());
    }

    protected abstract D createDto();

    protected abstract void mapSpecificFields(T product, D dto);
}