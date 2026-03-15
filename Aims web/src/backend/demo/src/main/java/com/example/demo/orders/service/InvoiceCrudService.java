package com.example.demo.orders.service;

import com.example.demo.orders.dto.request.InvoiceRequestDTO;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;

import java.util.List;

/**
 * Interface for basic Invoice CRUD operations.
 * Follows Interface Segregation Principle - only contains basic CRUD methods.
 */
public interface InvoiceCrudService {

    /**
     * Create a new invoice
     */
    InvoiceResponseDTO create(InvoiceRequestDTO dto);

    /**
     * Update an existing invoice
     */
    InvoiceResponseDTO update(String id, InvoiceRequestDTO dto);

    /**
     * Get invoice by ID
     */
    InvoiceResponseDTO getById(String id);

    /**
     * Get invoice by ID with items
     */
    InvoiceResponseDTO getByIdWithItems(String id);

    /**
     * Get all invoices
     */
    List<InvoiceResponseDTO> getAll();
}
