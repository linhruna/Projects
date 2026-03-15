package com.example.demo.orders.service.impl;

import com.example.demo.orders.service.ShippingService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Implementation of ShippingService.
 * Calculates shipping fees based on:
 * - Metro cities (Hanoi/HCM): 22,000 VND for first 3kg, then 2,500 VND per
 * 0.5kg
 * - Other cities: 30,000 VND for first 0.5kg, then 2,500 VND per 0.5kg
 * - Free shipping discount of up to 25,000 VND for orders > 100,000 VND
 */
@Service
public class ShippingServiceImpl implements ShippingService {

    // Shipping fee calculation constants
    private static final float FREE_SHIPPING_THRESHOLD = 100000f; // VND
    private static final float MAX_FREE_SHIPPING_DISCOUNT = 25000f; // VND
    private static final float HANOI_HCM_BASE_FEE = 22000f; // VND for first 3kg
    private static final float HANOI_HCM_BASE_WEIGHT = 3f; // kg
    private static final float OTHER_CITY_BASE_FEE = 30000f; // VND for first 0.5kg
    private static final float OTHER_CITY_BASE_WEIGHT = 0.5f; // kg
    private static final float ADDITIONAL_FEE_PER_UNIT = 2500f; // VND per 0.5kg
    private static final float WEIGHT_UNIT = 0.5f; // kg

    // Metro city names and codes for Hanoi and Ho Chi Minh City
    private static final List<String> METRO_CITIES = Arrays.asList(
            "Hà Nội", "Ha Noi", "Hanoi", "HN",
            "TP. Hồ Chí Minh", "TP Hồ Chí Minh", "Hồ Chí Minh", "Ho Chi Minh",
            "TP.HCM", "TPHCM", "HCM", "Sài Gòn", "Saigon");

    @Override
    public Float calculateShippingFee(Float totalWeight, String city, Float subtotal) {
        if (totalWeight == null || totalWeight <= 0) {
            totalWeight = 0.5f; // Minimum weight
        }
        if (subtotal == null) {
            subtotal = 0f;
        }

        boolean isMetro = isMetroCity(city);

        // Calculate free shipping discount for orders > 100,000 VND (up to 25,000 VND)
        float freeShippingDiscount = subtotal > FREE_SHIPPING_THRESHOLD ? MAX_FREE_SHIPPING_DISCOUNT : 0f;
        float shippingFee;

        if (isMetro) {
            // Hanoi/HCM: 22,000 VND for first 3kg, then 2,500 VND per 0.5kg
            shippingFee = HANOI_HCM_BASE_FEE;
            if (totalWeight > HANOI_HCM_BASE_WEIGHT) {
                float extraWeight = totalWeight - HANOI_HCM_BASE_WEIGHT;
                int extraUnits = (int) Math.ceil(extraWeight / WEIGHT_UNIT);
                shippingFee += extraUnits * ADDITIONAL_FEE_PER_UNIT;
            }
        } else {
            // Other locations: 30,000 VND for first 0.5kg, then 2,500 VND per 0.5kg
            shippingFee = OTHER_CITY_BASE_FEE;
            if (totalWeight > OTHER_CITY_BASE_WEIGHT) {
                float extraWeight = totalWeight - OTHER_CITY_BASE_WEIGHT;
                int extraUnits = (int) Math.ceil(extraWeight / WEIGHT_UNIT);
                shippingFee += extraUnits * ADDITIONAL_FEE_PER_UNIT;
            }
        }

        // Apply free shipping discount (cannot exceed shipping fee)
        float discount = Math.min(shippingFee, freeShippingDiscount);
        return Math.max(0f, shippingFee - discount);
    }

    @Override
    public boolean isMetroCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            return false;
        }
        String normalizedCity = city.trim().toLowerCase();
        return METRO_CITIES.stream()
                .anyMatch(metro -> metro.toLowerCase().equals(normalizedCity));
    }

    @Override
    public List<String> getMetroCityNames() {
        return Arrays.asList("Hà Nội", "TP. Hồ Chí Minh");
    }
}
