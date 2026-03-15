package com.example.demo.orders.event;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

/**
 * Event fired when an order is approved by product manager.
 */
public class OrderApprovedEvent extends OrderEvent {

    public OrderApprovedEvent(Object source, InvoiceResponseDTO invoice) {
        super(source, invoice);
    }
}
