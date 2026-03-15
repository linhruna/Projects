package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

/**
 * Strategy interface for email template generation.
 * Each email type (confirmation, rejection, approval, etc.) implements this
 * interface.
 * This follows the Strategy Pattern to allow different email templates to be
 * used interchangeably.
 */
public interface EmailTemplateStrategy {

    /**
     * Get the template type identifier
     * 
     * @return template type name (e.g., "ORDER_CONFIRMATION", "ORDER_REJECTION")
     */
    String getTemplateType();

    /**
     * Get the email subject
     * 
     * @param invoice the invoice data
     * @return the email subject line
     */
    String getSubject(InvoiceResponseDTO invoice);

    /**
     * Build the HTML content for the email
     * 
     * @param invoice the invoice data
     * @param baseUrl the base URL for links
     * @return the HTML email content
     */
    String buildContent(InvoiceResponseDTO invoice, String baseUrl);
}
