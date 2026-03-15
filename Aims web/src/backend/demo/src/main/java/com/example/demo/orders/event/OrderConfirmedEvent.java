package com.example.demo.orders.event;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

/**
 * Event fired when payment is completed and order needs confirmation email.
 */
public class OrderConfirmedEvent extends OrderEvent {

    public OrderConfirmedEvent(Object source, InvoiceResponseDTO invoice) {
        super(source, invoice);
    }
}
