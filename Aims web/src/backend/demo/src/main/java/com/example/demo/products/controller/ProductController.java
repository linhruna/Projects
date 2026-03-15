package com.example.demo.products.controller;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.dto.response.ProductResponseDTO;
import com.example.demo.products.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ProductResponseDTO create(@RequestBody ProductRequestDTO dto) {
        return productService.create(dto);
    }

    @GetMapping("/{id}")
    public ProductResponseDTO get(@PathVariable String id) {
        return productService.get(id);
    }

    @PutMapping("/{id}")
    public ProductResponseDTO update(@PathVariable String id, @RequestBody ProductRequestDTO dto) {
        return productService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        productService.delete(id);
    }

    @GetMapping
    public List<ProductResponseDTO> list(@RequestParam(required = false) String type) {
        return productService.list(type);
    }

    @GetMapping("/type/{Category}")
    public List<ProductResponseDTO> getProductsByCategory(@PathVariable String Category) {
        return productService.getProductsByCategory(Category);
    }

    @GetMapping("/by-author/{authorId}")
    public List<ProductResponseDTO> getProductsByAuthor(@PathVariable String authorId) {
        return productService.getProductsByAuthor(authorId);
    }

    @GetMapping("/by-section/{sectionId}")
    public List<ProductResponseDTO> getProductsBySection(@PathVariable String sectionId) {
        return productService.getProductsBySection(sectionId);
    }

}
