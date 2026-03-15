package com.example.demo.orders.dto.response;

import lombok.Data;

@Data
public class InvoiceItemResponseDTO {
    private String id;
    private String productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private Float price;
    private Float subtotal;
}

