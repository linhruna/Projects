package com.example.demo.orders.service;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import org.springframework.data.domain.Page;

/**
 * Interface for Order Management operations (approve, reject, cancel).
 * Follows Interface Segregation Principle - only contains order workflow
 * methods.
 * Used by Product Managers to process orders.
 */
public interface OrderManagementService {

    /**
     * Complete payment - set transaction info and change status to
     * PENDING_PROCESSING
     */
    InvoiceResponseDTO completePayment(String id, String transactionId, String transactionContent);

    /**
     * Approve an order (Product Manager action)
     */
    InvoiceResponseDTO approveOrder(String id, String approvedBy);

    /**
     * Reject an order (Product Manager action)
     */
    InvoiceResponseDTO rejectOrder(String id, String rejectedBy, String reason);

    /**
     * Cancel an order (Customer action)
     */
    InvoiceResponseDTO cancelOrder(String id, String reason);

    /**
     * Cancel order using access token (from email link)
     */
    InvoiceResponseDTO cancelOrderByAccessToken(String token, String reason);

    /**
     * Get pending orders with pagination (for Product Manager)
     */
    Page<InvoiceResponseDTO> getPendingOrders(int page, int size);

    /**
     * Get processed orders (approved, rejected, cancelled) with pagination
     */
    Page<InvoiceResponseDTO> getProcessedOrders(int page, int size);
}
