package com.example.demo.payment.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PaypalRequest extends PaymentRequest {
    private Long amount;
    private String currency = "USD";
}