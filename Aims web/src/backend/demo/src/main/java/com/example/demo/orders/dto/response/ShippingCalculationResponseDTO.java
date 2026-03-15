package com.example.demo.orders.dto.response;

import lombok.Data;

/**
 * Response DTO for shipping fee calculation.
 */
@Data
public class ShippingCalculationResponseDTO {
    private Float shippingFee; // Calculated shipping fee in VND
    private Float freeShippingDiscount; // Applied free shipping discount
    private Boolean isMetroCity; // Whether delivery is to a metro city
    private String city; // Delivery city/province
    private Float totalWeight; // Total weight used for calculation
    private Float subtotal; // Order subtotal used for calculation

    // Constants for frontend reference
    private Float freeShippingThreshold; // Order amount for free shipping eligibility
    private Float maxFreeShippingDiscount; // Maximum free shipping discount
}
