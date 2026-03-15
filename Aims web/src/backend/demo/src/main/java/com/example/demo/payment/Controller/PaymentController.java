package com.example.demo.payment.Controller;

import com.example.demo.orders.service.InvoiceService;
import com.example.demo.payment.dto.request.PaypalRequest;
import com.example.demo.payment.dto.request.VietQrRequest;
import com.example.demo.payment.dto.response.PaymentResponse;
import com.example.demo.payment.strategy.PaymentStrategyContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Payment Controller using Strategy Pattern.
 * Delegates payment processing to appropriate strategies via
 * PaymentStrategyContext.
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentStrategyContext paymentStrategyContext;
    private final InvoiceService invoiceService;

    // Store payment confirmations (in production, use database)
    private static final ConcurrentHashMap<String, Boolean> paymentConfirmations = new ConcurrentHashMap<>();

    /**
     * Process VietQR payment using Strategy Pattern
     */
    @PostMapping("/vietqr")
    public ResponseEntity<PaymentResponse> createVietQr(@RequestBody VietQrRequest request) {
        PaymentResponse response = paymentStrategyContext.processPayment("VIETQR", request);
        return ResponseEntity.ok(response);
    }

    /**
     * Process PayPal payment using Strategy Pattern
     */
    @PostMapping("/paypal")
    public ResponseEntity<PaymentResponse> createPaypal(@RequestBody PaypalRequest request) {
        PaymentResponse response = paymentStrategyContext.processPayment("PAYPAL", request);
        return ResponseEntity.ok(response);
    }

    /**
     * Generic payment endpoint - auto-detects payment strategy based on request
     * type
     */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody VietQrRequest request) {
        // This demonstrates auto-detection of strategy based on request type
        PaymentResponse response = paymentStrategyContext.processPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Check VietQR payment status
     * In production, this would query VietQR's API or check webhook data
     */
    @GetMapping("/vietqr/status/{transactionId}")
    public ResponseEntity<Map<String, Object>> checkVietQrStatus(@PathVariable String transactionId) {
        Boolean confirmed = paymentConfirmations.get(transactionId);
        return ResponseEntity.ok(Map.of(
                "transactionId", transactionId,
                "status", confirmed != null && confirmed ? "CONFIRMED" : "PENDING",
                "message",
                confirmed != null && confirmed ? "Thanh toán đã được xác nhận" : "Đang chờ xác nhận thanh toán"));
    }

    /**
     * Confirm VietQR payment (called by webhook or manual confirmation)
     * In production, this would be called by VietQR webhook
     * This also calls invoiceService.completePayment to convert invoice to
     * transaction
     */
    @PostMapping("/vietqr/confirm/{invoiceId}")
    public ResponseEntity<Map<String, Object>> confirmVietQrPayment(@PathVariable String invoiceId) {
        try {
            // Mark as confirmed
            paymentConfirmations.put(invoiceId, true);

            // Generate transaction info
            String transactionId = "VIETQR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String transactionContent = "VietQR Payment - "
                    + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

            // Call invoiceService to complete payment and convert to transaction
            invoiceService.completePayment(invoiceId, transactionId, transactionContent);

            return ResponseEntity.ok(Map.of(
                    "transactionId", transactionId,
                    "invoiceId", invoiceId,
                    "status", "CONFIRMED",
                    "message", "Thanh toán đã được xác nhận thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FAILED",
                    "message", "Lỗi xác nhận thanh toán: " + e.getMessage()));
        }
    }
}
