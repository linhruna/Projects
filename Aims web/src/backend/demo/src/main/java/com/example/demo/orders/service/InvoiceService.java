package com.example.demo.orders.service;

/**
 * Composite interface that extends all invoice-related interfaces.
 * This maintains backward compatibility with existing code.
 * 
 * For new code, prefer using the segregated interfaces:
 * - {@link InvoiceCrudService} for basic CRUD operations
 * - {@link OrderManagementService} for order workflow (approve/reject/cancel)
 * - {@link OrderQueryService} for order queries
 * 
 * This follows the Interface Segregation Principle (ISP) by allowing clients
 * to depend only on the specific interface they need.
 */
public interface InvoiceService extends InvoiceCrudService, OrderManagementService, OrderQueryService {
    // This composite interface inherits all methods from the segregated interfaces
    // No additional methods needed - all are inherited
}
