package com.example.demo.orders.event;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

/**
 * Event fired when an order is rejected by product manager.
 */
public class OrderRejectedEvent extends OrderEvent {

    public OrderRejectedEvent(Object source, InvoiceResponseDTO invoice) {
        super(source, invoice);
    }
}
