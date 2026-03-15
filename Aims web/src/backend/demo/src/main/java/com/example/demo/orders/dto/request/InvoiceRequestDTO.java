package com.example.demo.orders.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class InvoiceRequestDTO {
    // Dùng cho hàm CREATE: Danh sách sản phẩm muốn mua
    private List<InvoiceItemRequestDTO> items;

    // Dùng cho hàm UPDATE: Thông tin người nhận và thanh toán
    private DeliveryInfoRequestDTO deliveryInfo;
    private String paymentMethod;
}