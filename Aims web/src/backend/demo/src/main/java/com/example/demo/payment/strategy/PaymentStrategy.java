package com.example.demo.payment.strategy;

import com.example.demo.payment.dto.request.PaymentRequest;
import com.example.demo.payment.dto.response.PaymentResponse;

/**
 * Strategy interface for payment processing.
 * Each payment method (VietQR, PayPal, etc.) implements this interface.
 * This follows the Strategy Pattern to allow different payment algorithms to be
 * used interchangeably.
 */
public interface PaymentStrategy {

    /**
     * Get the payment method identifier
     * 
     * @return payment method name (e.g., "VIETQR", "PAYPAL")
     */
    String getPaymentMethod();

    /**
     * Check if this strategy can handle the given request type
     * 
     * @param request the payment request
     * @return true if this strategy can process the request
     */
    boolean supports(PaymentRequest request);

    /**
     * Process the payment
     * 
     * @param request the payment request
     * @return payment response with status and details
     */
    PaymentResponse process(PaymentRequest request);
}
