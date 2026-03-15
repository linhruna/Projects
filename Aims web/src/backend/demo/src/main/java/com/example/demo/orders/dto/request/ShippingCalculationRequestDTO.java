package com.example.demo.orders.dto.request;

import lombok.Data;

/**
 * Request DTO for shipping fee calculation.
 */
@Data
public class ShippingCalculationRequestDTO {
    private Float totalWeight; // Total weight in kg
    private String city; // Delivery city/province
    private Float subtotal; // Order subtotal for free shipping calculation
}
