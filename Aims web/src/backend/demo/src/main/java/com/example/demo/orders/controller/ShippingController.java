package com.example.demo.orders.controller;

import com.example.demo.orders.dto.request.ShippingCalculationRequestDTO;
import com.example.demo.orders.dto.response.ShippingCalculationResponseDTO;
import com.example.demo.orders.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for shipping-related operations.
 * Provides endpoints for calculating shipping fees.
 */
@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;

    // Constants for response
    private static final Float FREE_SHIPPING_THRESHOLD = 100000f;
    private static final Float MAX_FREE_SHIPPING_DISCOUNT = 25000f;

    /**
     * Calculate shipping fee based on weight, city, and subtotal.
     * POST /api/shipping/calculate
     */
    @PostMapping("/calculate")
    public ShippingCalculationResponseDTO calculateShippingFee(
            @RequestBody ShippingCalculationRequestDTO request) {

        Float shippingFee = shippingService.calculateShippingFee(
                request.getTotalWeight(),
                request.getCity(),
                request.getSubtotal());

        boolean isMetro = shippingService.isMetroCity(request.getCity());

        // Calculate applied discount
        Float appliedDiscount = 0f;
        if (request.getSubtotal() != null && request.getSubtotal() > FREE_SHIPPING_THRESHOLD) {
            appliedDiscount = MAX_FREE_SHIPPING_DISCOUNT;
        }

        ShippingCalculationResponseDTO response = new ShippingCalculationResponseDTO();
        response.setShippingFee(shippingFee);
        response.setFreeShippingDiscount(appliedDiscount);
        response.setIsMetroCity(isMetro);
        response.setCity(request.getCity());
        response.setTotalWeight(request.getTotalWeight());
        response.setSubtotal(request.getSubtotal());
        response.setFreeShippingThreshold(FREE_SHIPPING_THRESHOLD);
        response.setMaxFreeShippingDiscount(MAX_FREE_SHIPPING_DISCOUNT);

        return response;
    }

    /**
     * Get list of metro city names for frontend reference.
     * GET /api/shipping/metro-cities
     */
    @GetMapping("/metro-cities")
    public List<String> getMetroCities() {
        return shippingService.getMetroCityNames();
    }
}
