package com.example.demo.email;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

public interface EmailService {
    void sendOrderConfirmation(InvoiceResponseDTO invoice);

    void sendOrderRejection(InvoiceResponseDTO invoice);

    void sendOrderApproval(InvoiceResponseDTO invoice);

    void sendOrderCancellation(InvoiceResponseDTO invoice);

    // User management notifications
    void sendUserNotification(String email, String userName, String subject, String message);
}
