package com.example.demo.orders.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponseDTO {
    private String id;
    private LocalDateTime createAt;
    private String status;
    private Float amount;
    private String paymentMethod;

    // Transaction information
    private String transactionId;
    private String transactionContent;
    private LocalDateTime transactionDateTime;

    // Approval info
    private String approvedBy;
    private LocalDateTime approvedDateTime;

    // Rejection/Cancellation info
    private String rejectionReason;
    private LocalDateTime rejectionDateTime;
    private String rejectedBy;
    private LocalDateTime cancelledDateTime;
    private String cancellationReason;

    // Email tracking
    private Boolean emailSent;
    private LocalDateTime emailSentAt;

    // Order access token for email links
    private String orderAccessToken;

    // Delivery information
    private DeliveryInfoResponseDTO deliveryInfo;

    // Invoice items
    private List<InvoiceItemResponseDTO> items;
}