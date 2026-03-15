package com.example.demo.orders.controller;

import com.example.demo.orders.dto.request.InvoiceRequestDTO;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import com.example.demo.orders.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public InvoiceResponseDTO createInvoice(@RequestBody InvoiceRequestDTO dto) {
        return invoiceService.create(dto);
    }

    @PutMapping("/{id}")
    public InvoiceResponseDTO updateInvoice(@PathVariable String id, @RequestBody InvoiceRequestDTO dto) {
        return invoiceService.update(id, dto);
    }

    @GetMapping("/{id}")
    public InvoiceResponseDTO getInvoice(@PathVariable String id) {
        return invoiceService.getByIdWithItems(id);
    }

    @GetMapping
    public List<InvoiceResponseDTO> getAllInvoices() {
        return invoiceService.getAll();
    }

    // Get pending orders for Product Manager (30 per page)
    @GetMapping("/pending")
    public Page<InvoiceResponseDTO> getPendingOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return invoiceService.getPendingOrders(page, size);
    }

    // Get processed orders for Product Manager (approved, rejected, cancelled - 30
    // per page)
    @GetMapping("/processed")
    public Page<InvoiceResponseDTO> getProcessedOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return invoiceService.getProcessedOrders(page, size);
    }

    // Complete payment - called after successful payment
    @PostMapping("/{id}/complete-payment")
    public InvoiceResponseDTO completePayment(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String transactionId = body.get("transactionId");
        String transactionContent = body.get("transactionContent");
        return invoiceService.completePayment(id, transactionId, transactionContent);
    }

    // Product Manager: Approve order
    @PostMapping("/{id}/approve")
    public InvoiceResponseDTO approveOrder(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String approvedBy = body.get("approvedBy");
        return invoiceService.approveOrder(id, approvedBy);
    }

    // Product Manager: Reject order
    @PostMapping("/{id}/reject")
    public InvoiceResponseDTO rejectOrder(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String rejectedBy = body.get("rejectedBy");
        String reason = body.get("reason");
        return invoiceService.rejectOrder(id, rejectedBy, reason);
    }

    // Customer: Cancel order
    @PostMapping("/{id}/cancel")
    public InvoiceResponseDTO cancelOrder(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return invoiceService.cancelOrder(id, reason);
    }

    // Get orders by customer email
    @GetMapping("/by-email")
    public List<InvoiceResponseDTO> getOrdersByEmail(@RequestParam String email) {
        return invoiceService.getOrdersByEmail(email);
    }

    // Public: Get order by access token (for email links - no auth required)
    @GetMapping("/public/{token}")
    public InvoiceResponseDTO getOrderByToken(@PathVariable String token) {
        return invoiceService.getByAccessToken(token);
    }

    // Public: Cancel order by access token (for email links - no auth required)
    @PostMapping("/public/{token}/cancel")
    public InvoiceResponseDTO cancelOrderByToken(
            @PathVariable String token,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return invoiceService.cancelOrderByAccessToken(token,
                reason != null ? reason : "Customer requested cancellation via email link");
    }
}
