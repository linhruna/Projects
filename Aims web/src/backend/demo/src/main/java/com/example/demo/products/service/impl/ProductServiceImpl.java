package com.example.demo.products.service.impl;

import com.example.demo.products.converter.ProductConverter;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.dto.response.ProductResponseDTO;
import com.example.demo.products.factory.ProductFactory;
import com.example.demo.products.entity.Product;
import com.example.demo.products.converter.mapperToEntity.ProductRequestMapper;
import com.example.demo.products.factory.ProductFactoryRegistry;
import com.example.demo.products.repository.ProductRepository;
import com.example.demo.products.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductConverter productConverter;
    private final ProductRequestMapper requestMapper;
    private final ProductFactoryRegistry productFactoryRegistry;

    @Override
    public ProductResponseDTO create(ProductRequestDTO dto) {
        validatePriceRange(dto.getOriginalValue(), dto.getCurrentPrice());

        Product product = productFactoryRegistry.create(dto);
        product.setId(UUID.randomUUID().toString());

        requestMapper.mapCommonFields(product, dto);
        requestMapper.mapSpecificFields(product, dto);

        Product savedProduct = productRepository.save(product);
        return productConverter.toResponse(savedProduct);
    }
    @Override
    public ProductResponseDTO get(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return productConverter.toResponse(product);
    }

    @Override
    public ProductResponseDTO update(String id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Long originalValue = product.getOriginalValue();
        if (originalValue == null || originalValue <= 0) {
            originalValue = product.getCurrentPrice();
        }

        validatePriceRange(originalValue, dto.getCurrentPrice());

        requestMapper.mapCommonFieldsForUpdate(product, dto);
        requestMapper.mapSpecificFields(product, dto);

        Product updatedProduct = productRepository.save(product);
        return productConverter.toResponse(updatedProduct);
    }

    @Override
    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductResponseDTO> list(String type) {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(productConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByCategory(String Category) {
        List<Product> products = productRepository.findByCategory(Category);
        return products.stream()
                .map(productConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsByAuthor(String authorId) {
        // repository method returns Book subtype list; conversion handled by productConverter
        List productList = productRepository.findByAuthors_Id(authorId);
        return ((List<Product>) productList).stream()
                .map(productConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponseDTO> getProductsBySection(String sectionId) {
        List productList = productRepository.findBySection_Id(sectionId);
        return ((List<Product>) productList).stream()
                .map(productConverter::toResponse)
                .collect(Collectors.toList());
    }

    private void validatePriceRange(Long originalValue, Long currentPrice) {
        if (currentPrice == null || currentPrice <= 0) {
            throw new IllegalArgumentException("Current price must be a positive number");
        }

        Long effectiveOriginalValue = (originalValue != null && originalValue > 0) ? originalValue : currentPrice;
        double minPrice = effectiveOriginalValue * 0.30;
        double maxPrice = effectiveOriginalValue * 1.50;

        if (currentPrice < minPrice || currentPrice > maxPrice) {
            throw new IllegalArgumentException(
                    String.format("Current price must be between 30%% and 150%% of original value. " +
                                    "Valid range: %,.0f₫ - %,.0f₫. Current price: %,d₫",
                            minPrice, maxPrice, currentPrice)
            );
        }
    }
}