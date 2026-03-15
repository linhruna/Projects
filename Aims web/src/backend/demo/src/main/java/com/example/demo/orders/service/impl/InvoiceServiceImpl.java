package com.example.demo.orders.service.impl;

import com.example.demo.orders.converter.InvoiceConverter;
import com.example.demo.orders.dto.request.InvoiceRequestDTO;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import com.example.demo.orders.entity.DeliveryInfo;
import com.example.demo.orders.entity.Invoice;
import com.example.demo.orders.entity.InvoiceItem;
import com.example.demo.orders.event.OrderApprovedEvent;
import com.example.demo.orders.event.OrderCancelledEvent;
import com.example.demo.orders.event.OrderConfirmedEvent;
import com.example.demo.orders.event.OrderRejectedEvent;
import com.example.demo.orders.repository.DeliveryInfoRepository;
import com.example.demo.orders.repository.InvoiceItemRepository;
import com.example.demo.orders.repository.InvoiceRepository;
import com.example.demo.orders.service.InvoiceService;
import com.example.demo.products.entity.Product;
import com.example.demo.products.repository.ProductRepository;
import com.example.demo.products.service.InventoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Invoice Service implementation.
 * Follows SRP by delegating:
 * - Inventory management to InventoryService
 * - Email sending to event-based async processing
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final DeliveryInfoRepository deliveryInfoRepository;
    private final ProductRepository productRepository;
    private final InvoiceConverter invoiceConverter;
    private final InventoryService inventoryService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public InvoiceResponseDTO create(InvoiceRequestDTO dto) {
        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID().toString());
        invoice.setCreateAt(LocalDateTime.now());
        invoice.setStatus("PENDING");
        invoice.setAmount(0f);
        invoice.setEmailSent(false);
        // Generate unique access token for email links
        invoice.setOrderAccessToken(UUID.randomUUID().toString().replace("-", ""));

        invoice = invoiceRepository.save(invoice);

        float totalAmount = 0f;
        List<InvoiceItem> invoiceItems = new ArrayList<>();

        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (var itemDto : dto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

                InvoiceItem item = new InvoiceItem();
                item.setId(UUID.randomUUID().toString());
                item.setInvoice(invoice);
                item.setProduct(product);
                item.setQuantity(itemDto.getQuantity());

                Float price = product.getCurrentPrice() != null ? product.getCurrentPrice().floatValue() : 0f;
                item.setPrice(price);

                totalAmount += price * itemDto.getQuantity();

                invoiceItems.add(item);
            }
            invoiceItemRepository.saveAll(invoiceItems);
        }

        invoice.setAmount(totalAmount);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        return invoiceConverter.toDTO(savedInvoice, invoiceItems);
    }

    @Override
    public InvoiceResponseDTO update(String id, InvoiceRequestDTO dto) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        if (!"PENDING".equalsIgnoreCase(invoice.getStatus())) {
            throw new RuntimeException("Invoice cannot be updated because it is already " + invoice.getStatus());
        }

        if (dto.getDeliveryInfo() != null) {
            DeliveryInfo deliveryInfo = new DeliveryInfo();
            deliveryInfo.setId(UUID.randomUUID().toString());

            deliveryInfo.setReceiveName(dto.getDeliveryInfo().getReceiveName());
            deliveryInfo.setPhoneNumber(dto.getDeliveryInfo().getPhoneNumber());
            deliveryInfo.setEmail(dto.getDeliveryInfo().getEmail());
            deliveryInfo.setCity(dto.getDeliveryInfo().getCity());
            deliveryInfo.setWard(dto.getDeliveryInfo().getWard());
            deliveryInfo.setDetailAddress(dto.getDeliveryInfo().getDetailAddress());
            deliveryInfo.setNote(dto.getDeliveryInfo().getNote());

            deliveryInfo = deliveryInfoRepository.save(deliveryInfo);

            invoice.setDeliveryInfo(deliveryInfo);
        }

        if (dto.getPaymentMethod() != null) {
            invoice.setPaymentMethod(dto.getPaymentMethod());
        }

        invoice.setStatus("CONFIRMED");

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);

        return invoiceConverter.toDTO(updatedInvoice, items);
    }

    @Override
    public InvoiceResponseDTO getById(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        return invoiceConverter.toDTO(invoice);
    }

    @Override
    public InvoiceResponseDTO getByIdWithItems(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);
        return invoiceConverter.toDTO(invoice, items);
    }

    @Override
    public List<InvoiceResponseDTO> getAll() {
        return invoiceRepository.findAll().stream()
                .map(invoice -> {
                    List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
                    return invoiceConverter.toDTO(invoice, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<InvoiceResponseDTO> getPendingOrders(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Invoice> invoicePage = invoiceRepository.findByStatusOrderByCreateAtDesc("PENDING_PROCESSING",
                pageRequest);
        return invoicePage.map(invoice -> {
            List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
            return invoiceConverter.toDTO(invoice, items);
        });
    }

    @Override
    public InvoiceResponseDTO completePayment(String id, String transactionId, String transactionContent) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        invoice.setTransactionId(transactionId);
        invoice.setTransactionContent(transactionContent);
        invoice.setTransactionDateTime(LocalDateTime.now());
        invoice.setStatus("PENDING_PROCESSING");

        Invoice savedInvoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);

        InvoiceResponseDTO responseDTO = invoiceConverter.toDTO(savedInvoice, items);

        // Publish event for async email sending (SRP - decoupled from email logic)
        eventPublisher.publishEvent(new OrderConfirmedEvent(this, responseDTO));

        return responseDTO;
    }

    @Override
    public InvoiceResponseDTO approveOrder(String id, String approvedBy) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        if (!"PENDING_PROCESSING".equals(invoice.getStatus())) {
            throw new RuntimeException("Only pending orders can be approved. Current status: " + invoice.getStatus());
        }

        // Deduct product quantities using InventoryService (SRP)
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);
        inventoryService.deductStock(items);

        invoice.setStatus("APPROVED");
        invoice.setApprovedBy(approvedBy);
        invoice.setApprovedDateTime(LocalDateTime.now());
        Invoice savedInvoice = invoiceRepository.save(invoice);

        InvoiceResponseDTO responseDTO = invoiceConverter.toDTO(savedInvoice, items);

        // Publish event for async email sending (SRP)
        eventPublisher.publishEvent(new OrderApprovedEvent(this, responseDTO));

        return responseDTO;
    }

    @Override
    public InvoiceResponseDTO rejectOrder(String id, String rejectedBy, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        if (!"PENDING_PROCESSING".equals(invoice.getStatus())) {
            throw new RuntimeException("Only pending orders can be rejected. Current status: " + invoice.getStatus());
        }

        invoice.setStatus("REJECTED");
        invoice.setRejectedBy(rejectedBy);
        invoice.setRejectionReason(reason);
        invoice.setRejectionDateTime(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);

        InvoiceResponseDTO responseDTO = invoiceConverter.toDTO(savedInvoice, items);

        // Publish event for async email sending (SRP)
        eventPublisher.publishEvent(new OrderRejectedEvent(this, responseDTO));

        return responseDTO;
    }

    @Override
    public InvoiceResponseDTO cancelOrder(String id, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        // Can only cancel orders that are pending processing
        if (!"PENDING_PROCESSING".equals(invoice.getStatus())) {
            throw new RuntimeException("Order can only be cancelled when in pending processing state. Current status: "
                    + invoice.getStatus());
        }

        invoice.setStatus("CANCELLED");
        invoice.setCancellationReason(reason);
        invoice.setCancelledDateTime(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(id);

        InvoiceResponseDTO responseDTO = invoiceConverter.toDTO(savedInvoice, items);

        // Publish event for async email sending (SRP)
        eventPublisher.publishEvent(new OrderCancelledEvent(this, responseDTO));

        return responseDTO;
    }

    @Override
    public List<InvoiceResponseDTO> getOrdersByEmail(String email) {
        return invoiceRepository.findByDeliveryInfoEmailOrderByCreateAtDesc(email).stream()
                .map(invoice -> {
                    List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
                    return invoiceConverter.toDTO(invoice, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceResponseDTO getByAccessToken(String token) {
        Invoice invoice = invoiceRepository.findByOrderAccessToken(token)
                .orElseThrow(() -> new RuntimeException("Order not found with provided access token"));
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
        return invoiceConverter.toDTO(invoice, items);
    }

    @Override
    public InvoiceResponseDTO cancelOrderByAccessToken(String token, String reason) {
        Invoice invoice = invoiceRepository.findByOrderAccessToken(token)
                .orElseThrow(() -> new RuntimeException("Order not found with provided access token"));

        // Can only cancel orders that are PENDING_PROCESSING
        if (!"PENDING_PROCESSING".equals(invoice.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled. Current status: " + invoice.getStatus());
        }

        invoice.setStatus("CANCELLED");
        invoice.setCancellationReason(reason);
        invoice.setCancelledDateTime(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());

        InvoiceResponseDTO responseDTO = invoiceConverter.toDTO(savedInvoice, items);

        // Publish event for async email sending (SRP)
        eventPublisher.publishEvent(new OrderCancelledEvent(this, responseDTO));

        return responseDTO;
    }

    @Override
    public Page<InvoiceResponseDTO> getProcessedOrders(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        List<String> processedStatuses = List.of("APPROVED", "REJECTED", "CANCELLED");
        Page<Invoice> invoicePage = invoiceRepository.findByStatusInOrderByCreateAtDesc(processedStatuses, pageRequest);
        return invoicePage.map(invoice -> {
            List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
            return invoiceConverter.toDTO(invoice, items);
        });
    }
}