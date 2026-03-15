package com.example.demo.orders.event;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

/**
 * Event fired when an order is cancelled.
 */
public class OrderCancelledEvent extends OrderEvent {

    public OrderCancelledEvent(Object source, InvoiceResponseDTO invoice) {
        super(source, invoice);
    }
}
