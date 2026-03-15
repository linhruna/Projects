package com.example.demo.orders.dto.request;

import lombok.Data;

@Data
public class InvoiceItemRequestDTO {
    private String productId;
    private Integer quantity;
}