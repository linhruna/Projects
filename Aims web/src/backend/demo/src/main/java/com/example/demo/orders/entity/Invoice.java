package com.example.demo.orders.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    private String id;

    private LocalDateTime createAt;

    // Status: PENDING, PENDING_PROCESSING, APPROVED, REJECTED, CANCELLED, REFUNDED
    private String status;

    private Float amount;

    private String paymentMethod;

    // Transaction information
    private String transactionId;
    private String transactionContent;
    private LocalDateTime transactionDateTime;

    // For order approval
    private String approvedBy;
    private LocalDateTime approvedDateTime;

    // For order rejection/cancellation
    private String rejectionReason;
    private LocalDateTime rejectionDateTime;
    private String rejectedBy;

    // For cancellation
    private LocalDateTime cancelledDateTime;
    private String cancellationReason;

    // Email notification tracking
    private Boolean emailSent;
    private LocalDateTime emailSentAt;

    // Order access token for email links (allows viewing/canceling without login)
    private String orderAccessToken;

    @ManyToOne
    @JoinColumn(name = "delivery_info_id")
    private DeliveryInfo deliveryInfo;
}
