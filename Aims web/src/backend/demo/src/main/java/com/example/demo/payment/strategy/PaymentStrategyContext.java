package com.example.demo.payment.strategy;

import com.example.demo.payment.dto.request.PaymentRequest;
import com.example.demo.payment.dto.response.PaymentResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Context class for Payment Strategy Pattern.
 * This class is responsible for selecting the appropriate payment strategy
 * based on the payment method and delegating the payment processing.
 */
@Component
public class PaymentStrategyContext {

    private final Map<String, PaymentStrategy> strategies;
    private final List<PaymentStrategy> strategyList;

    public PaymentStrategyContext(List<PaymentStrategy> strategies) {
        this.strategyList = strategies;
        this.strategies = strategies.stream()
                .collect(Collectors.toMap(
                        s -> s.getPaymentMethod().toUpperCase(Locale.ENGLISH),
                        s -> s,
                        (existing, replacement) -> existing));
    }

    /**
     * Process payment using the appropriate strategy based on payment method
     * 
     * @param paymentMethod the payment method identifier (e.g., "VIETQR", "PAYPAL")
     * @param request       the payment request
     * @return payment response
     */
    public PaymentResponse processPayment(String paymentMethod, PaymentRequest request) {
        String key = paymentMethod == null ? "" : paymentMethod.toUpperCase(Locale.ENGLISH);
        PaymentStrategy strategy = strategies.get(key);

        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }

        return strategy.process(request);
    }

    /**
     * Process payment by finding strategy that supports the request type
     * 
     * @param request the payment request
     * @return payment response
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        for (PaymentStrategy strategy : strategyList) {
            if (strategy.supports(request)) {
                return strategy.process(request);
            }
        }
        throw new IllegalArgumentException(
                "No payment strategy found for request type: " + request.getClass().getSimpleName());
    }

    /**
     * Get a specific payment strategy by method name
     * 
     * @param paymentMethod the payment method identifier
     * @return the payment strategy or null if not found
     */
    public PaymentStrategy getStrategy(String paymentMethod) {
        String key = paymentMethod == null ? "" : paymentMethod.toUpperCase(Locale.ENGLISH);
        return strategies.get(key);
    }

    /**
     * Check if a payment method is supported
     * 
     * @param paymentMethod the payment method identifier
     * @return true if the payment method is supported
     */
    public boolean isSupported(String paymentMethod) {
        String key = paymentMethod == null ? "" : paymentMethod.toUpperCase(Locale.ENGLISH);
        return strategies.containsKey(key);
    }
}
