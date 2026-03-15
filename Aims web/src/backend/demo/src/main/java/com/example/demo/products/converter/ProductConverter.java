package com.example.demo.products.converter;

            import com.example.demo.products.converter.mapperToResponse.ProductMapper;
            import com.example.demo.products.dto.response.ProductResponseDTO;
            import com.example.demo.products.entity.Product;
            import org.springframework.stereotype.Component;
            import java.util.List;

            @Component
            public class ProductConverter {

                private final List<ProductMapper> mappers;

                public ProductConverter(List<ProductMapper> mappers) {
                    this.mappers = mappers;
                }

                public ProductResponseDTO toResponse(Product product) {
                    if (product == null) return null;
                    return mappers.stream()
                            .filter(m -> m.supports(product))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("Unknown product type"))
                            .toResponse(product);
                }
            }