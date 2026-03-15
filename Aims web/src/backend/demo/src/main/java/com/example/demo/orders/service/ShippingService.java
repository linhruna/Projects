package com.example.demo.orders.service;

import java.util.List;

/**
 * Service for calculating shipping fees.
 * Follows the Single Responsibility Principle (SRP) by handling only
 * shipping-related logic.
 */
public interface ShippingService {

    /**
     * Calculate shipping fee based on weight, city, and subtotal.
     * 
     * @param totalWeight Total weight of items in kg
     * @param city        Delivery city/province name
     * @param subtotal    Order subtotal (for free shipping discount calculation)
     * @return Calculated shipping fee in VND
     */
    Float calculateShippingFee(Float totalWeight, String city, Float subtotal);

    /**
     * Check if a city is a metro city (Hanoi or Ho Chi Minh City)
     * for applying different shipping rates.
     * 
     * @param city City/province name
     * @return true if metro city (Hanoi/HCM), false otherwise
     */
    boolean isMetroCity(String city);

    /**
     * List of metro city names (for frontend reference if needed)
     */
    List<String> getMetroCityNames();
}
