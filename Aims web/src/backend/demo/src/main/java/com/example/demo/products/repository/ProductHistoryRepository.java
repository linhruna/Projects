package com.example.demo.products.repository;

import com.example.demo.products.entity.ProductHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductHistoryRepository extends JpaRepository<ProductHistory, String> {
    List<ProductHistory> findByProductIdOrderByTimestampDesc(String productId);
    List<ProductHistory> findAllByOrderByTimestampDesc();
}

