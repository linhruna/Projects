package com.example.demo.products.controller;

import com.example.demo.products.dto.request.ProductHistoryRequestDTO;
import com.example.demo.products.dto.response.ProductHistoryResponseDTO;
import com.example.demo.products.service.ProductHistoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-history")
@RequiredArgsConstructor
public class ProductHistoryController {

    private final ProductHistoryService productHistoryService;

    @PostMapping
    public ResponseEntity<ProductHistoryResponseDTO> create(@RequestBody ProductHistoryRequestDTO dto) {
        ProductHistoryResponseDTO response = productHistoryService.create(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductHistoryResponseDTO>> getAll() {
        List<ProductHistoryResponseDTO> history = productHistoryService.getAll();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductHistoryResponseDTO>> getByProductId(@PathVariable String productId) {
        List<ProductHistoryResponseDTO> history = productHistoryService.getByProductId(productId);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        productHistoryService.deleteAll();
        return ResponseEntity.ok().build();
    }
}

