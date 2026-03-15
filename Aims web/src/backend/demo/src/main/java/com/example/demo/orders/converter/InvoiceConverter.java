package com.example.demo.orders.converter;

import com.example.demo.orders.dto.response.DeliveryInfoResponseDTO;
import com.example.demo.orders.dto.response.InvoiceItemResponseDTO;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import com.example.demo.orders.entity.DeliveryInfo;
import com.example.demo.orders.entity.Invoice;
import com.example.demo.orders.entity.InvoiceItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InvoiceConverter {

    public InvoiceResponseDTO toDTO(Invoice entity) {
        if (entity == null) {
            return null;
        }
        InvoiceResponseDTO dto = new InvoiceResponseDTO();
        dto.setId(entity.getId());
        dto.setCreateAt(entity.getCreateAt());
        dto.setStatus(entity.getStatus());
        dto.setAmount(entity.getAmount());
        dto.setPaymentMethod(entity.getPaymentMethod());

        // Transaction information
        dto.setTransactionId(entity.getTransactionId());
        dto.setTransactionContent(entity.getTransactionContent());
        dto.setTransactionDateTime(entity.getTransactionDateTime());

        // Approval info
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setApprovedDateTime(entity.getApprovedDateTime());

        // Rejection/Cancellation info
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setRejectionDateTime(entity.getRejectionDateTime());
        dto.setRejectedBy(entity.getRejectedBy());
        dto.setCancelledDateTime(entity.getCancelledDateTime());
        dto.setCancellationReason(entity.getCancellationReason());

        // Email tracking
        dto.setEmailSent(entity.getEmailSent());
        dto.setEmailSentAt(entity.getEmailSentAt());

        // Order access token
        dto.setOrderAccessToken(entity.getOrderAccessToken());

        // Map DeliveryInfo
        if (entity.getDeliveryInfo() != null) {
            dto.setDeliveryInfo(toDeliveryInfoDTO(entity.getDeliveryInfo()));
        }

        return dto;
    }

    public InvoiceResponseDTO toDTO(Invoice entity, List<InvoiceItem> items) {
        InvoiceResponseDTO dto = toDTO(entity);
        if (items != null && !items.isEmpty()) {
            dto.setItems(items.stream()
                    .map(this::toInvoiceItemDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private DeliveryInfoResponseDTO toDeliveryInfoDTO(DeliveryInfo entity) {
        DeliveryInfoResponseDTO dto = new DeliveryInfoResponseDTO();
        dto.setId(entity.getId());
        dto.setReceiveName(entity.getReceiveName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        dto.setCity(entity.getCity());
        dto.setWard(entity.getWard());
        dto.setDetailAddress(entity.getDetailAddress());
        dto.setNote(entity.getNote());
        return dto;
    }

    private InvoiceItemResponseDTO toInvoiceItemDTO(InvoiceItem entity) {
        InvoiceItemResponseDTO dto = new InvoiceItemResponseDTO();
        dto.setId(entity.getId());
        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getId());
            dto.setProductName(entity.getProduct().getTitle());
            dto.setProductImage(entity.getProduct().getImageURL());
        }
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        dto.setSubtotal(entity.getPrice() * entity.getQuantity());
        return dto;
    }
}
