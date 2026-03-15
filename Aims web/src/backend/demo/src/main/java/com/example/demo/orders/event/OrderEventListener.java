package com.example.demo.orders.event;

import com.example.demo.email.EmailService;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import com.example.demo.orders.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Event listener for order events.
 * Handles sending emails when order status changes.
 * This decouples email sending from order processing (SRP).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final EmailService emailService;
    private final InvoiceRepository invoiceRepository;

    @Async
    @EventListener
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        InvoiceResponseDTO invoice = event.getInvoice();
        try {
            log.info("Sending order confirmation email for invoice: {}", invoice.getId());
            emailService.sendOrderConfirmation(invoice);
            updateEmailSentStatus(invoice.getId());
            log.info("Order confirmation email sent successfully for invoice: {}", invoice.getId());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for invoice {}: {}", invoice.getId(), e.getMessage());
        }
    }

    @Async
    @EventListener
    public void handleOrderApproved(OrderApprovedEvent event) {
        InvoiceResponseDTO invoice = event.getInvoice();
        try {
            log.info("Sending order approval email for invoice: {}", invoice.getId());
            emailService.sendOrderApproval(invoice);
            log.info("Order approval email sent successfully for invoice: {}", invoice.getId());
        } catch (Exception e) {
            log.error("Failed to send order approval email for invoice {}: {}", invoice.getId(), e.getMessage());
        }
    }

    @Async
    @EventListener
    public void handleOrderRejected(OrderRejectedEvent event) {
        InvoiceResponseDTO invoice = event.getInvoice();
        try {
            log.info("Sending order rejection email for invoice: {}", invoice.getId());
            emailService.sendOrderRejection(invoice);
            log.info("Order rejection email sent successfully for invoice: {}", invoice.getId());
        } catch (Exception e) {
            log.error("Failed to send order rejection email for invoice {}: {}", invoice.getId(), e.getMessage());
        }
    }

    @Async
    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        InvoiceResponseDTO invoice = event.getInvoice();
        try {
            log.info("Sending order cancellation email for invoice: {}", invoice.getId());
            emailService.sendOrderCancellation(invoice);
            log.info("Order cancellation email sent successfully for invoice: {}", invoice.getId());
        } catch (Exception e) {
            log.error("Failed to send order cancellation email for invoice {}: {}", invoice.getId(), e.getMessage());
        }
    }

    private void updateEmailSentStatus(String invoiceId) {
        invoiceRepository.findById(invoiceId).ifPresent(invoice -> {
            invoice.setEmailSent(true);
            invoice.setEmailSentAt(LocalDateTime.now());
            invoiceRepository.save(invoice);
        });
    }
}
