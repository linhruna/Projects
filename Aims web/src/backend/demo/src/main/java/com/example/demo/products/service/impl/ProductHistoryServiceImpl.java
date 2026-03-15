package com.example.demo.products.service.impl;

import com.example.demo.products.dto.request.ProductHistoryRequestDTO;
import com.example.demo.products.dto.response.ProductHistoryResponseDTO;
import com.example.demo.products.entity.ProductHistory;
import com.example.demo.products.repository.ProductHistoryRepository;
import com.example.demo.products.service.ProductHistoryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductHistoryServiceImpl implements ProductHistoryService {

    private final ProductHistoryRepository productHistoryRepository;

    @Override
    public ProductHistoryResponseDTO create(ProductHistoryRequestDTO dto) {
        ProductHistory history = new ProductHistory();
        history.setId(UUID.randomUUID().toString());
        history.setProductId(dto.getProductId());
        history.setProductName(dto.getProductName());
        history.setAction(dto.getAction().toUpperCase());
        history.setTimestamp(LocalDateTime.now());
        history.setUserName(dto.getUserName());
        history.setDetails(dto.getDetails());

        ProductHistory saved = productHistoryRepository.save(history);
        return toResponse(saved);
    }

    @Override
    public List<ProductHistoryResponseDTO> getAll() {
        return productHistoryRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductHistoryResponseDTO> getByProductId(String productId) {
        return productHistoryRepository.findByProductIdOrderByTimestampDesc(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAll() {
        productHistoryRepository.deleteAll();
    }

    private ProductHistoryResponseDTO toResponse(ProductHistory history) {
        ProductHistoryResponseDTO dto = new ProductHistoryResponseDTO();
        dto.setId(history.getId());
        dto.setProductId(history.getProductId());
        dto.setProductName(history.getProductName());
        dto.setAction(history.getAction());
        dto.setTimestamp(history.getTimestamp());
        dto.setUserName(history.getUserName());
        dto.setDetails(history.getDetails());
        return dto;
    }
}

