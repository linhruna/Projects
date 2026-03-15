package com.example.demo.products.service;

import com.example.demo.orders.entity.InvoiceItem;

import java.util.List;

/**
 * Service for inventory management operations.
 * Follows Single Responsibility Principle - only handles stock/inventory logic.
 */
public interface InventoryService {

    /**
     * Deduct product quantities when an order is approved
     * 
     * @param items the invoice items to deduct
     * @throws RuntimeException if insufficient stock for any product
     */
    void deductStock(List<InvoiceItem> items);

    /**
     * Restore product quantities when an order is cancelled/refunded
     * 
     * @param items the invoice items to restore
     */
    void restoreStock(List<InvoiceItem> items);

    /**
     * Check if all items have sufficient stock
     * 
     * @param items the invoice items to check
     * @return true if all items have sufficient stock
     */
    boolean hasEnoughStock(List<InvoiceItem> items);
}
