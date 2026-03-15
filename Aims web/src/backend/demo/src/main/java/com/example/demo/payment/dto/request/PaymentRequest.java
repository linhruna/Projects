package com.example.demo.payment.dto.request;

import lombok.Data;

@Data

public class PaymentRequest {
//    private Long amount;
    private String invoiceId;
    private String description;
}
