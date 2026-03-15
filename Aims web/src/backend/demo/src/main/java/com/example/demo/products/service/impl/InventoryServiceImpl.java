package com.example.demo.products.service.impl;

import com.example.demo.orders.entity.InvoiceItem;
import com.example.demo.products.entity.Product;
import com.example.demo.products.repository.ProductRepository;
import com.example.demo.products.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of InventoryService.
 * Handles all stock/inventory management operations.
 * Follows Single Responsibility Principle.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;

    @Override
    public void deductStock(List<InvoiceItem> items) {
        for (InvoiceItem item : items) {
            Product product = item.getProduct();
            int newQuantity = product.getQuantity() - item.getQuantity();

            if (newQuantity < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getTitle() +
                        ". Available: " + product.getQuantity() + ", Requested: " + item.getQuantity());
            }

            product.setQuantity(newQuantity);
            productRepository.save(product);
            log.info("Deducted {} units from product {}, new quantity: {}",
                    item.getQuantity(), product.getTitle(), newQuantity);
        }
    }

    @Override
    public void restoreStock(List<InvoiceItem> items) {
        for (InvoiceItem item : items) {
            Product product = item.getProduct();
            int newQuantity = product.getQuantity() + item.getQuantity();

            product.setQuantity(newQuantity);
            productRepository.save(product);
            log.info("Restored {} units to product {}, new quantity: {}",
                    item.getQuantity(), product.getTitle(), newQuantity);
        }
    }

    @Override
    public boolean hasEnoughStock(List<InvoiceItem> items) {
        for (InvoiceItem item : items) {
            Product product = item.getProduct();
            if (product.getQuantity() < item.getQuantity()) {
                log.warn("Insufficient stock for product {}: available={}, requested={}",
                        product.getTitle(), product.getQuantity(), item.getQuantity());
                return false;
            }
        }
        return true;
    }
}
