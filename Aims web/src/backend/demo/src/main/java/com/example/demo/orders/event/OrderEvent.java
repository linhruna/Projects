package com.example.demo.orders.event;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Base class for order-related events.
 * Uses Spring's event mechanism to decouple order processing from email
 * sending.
 * This follows the Single Responsibility Principle.
 */
@Getter
public abstract class OrderEvent extends ApplicationEvent {

    private final InvoiceResponseDTO invoice;

    public OrderEvent(Object source, InvoiceResponseDTO invoice) {
        super(source);
        this.invoice = invoice;
    }
}
