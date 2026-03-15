package com.example.demo.orders.service;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

import java.util.List;

/**
 * Interface for Order Query operations.
 * Follows Interface Segregation Principle - only contains query methods.
 * Used for public order lookups (e.g., by email, by access token).
 */
public interface OrderQueryService {

    /**
     * Get orders by customer email
     */
    List<InvoiceResponseDTO> getOrdersByEmail(String email);

    /**
     * Get order by access token (for email link access)
     */
    InvoiceResponseDTO getByAccessToken(String token);
}
