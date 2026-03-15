package com.example.demo.orders.dto.response;

import lombok.Data;

@Data
public class DeliveryInfoResponseDTO {
    private String id;
    private String receiveName;
    private String phoneNumber;
    private String email;
    private String city;
    private String ward;
    private String detailAddress;
    private String note;
}

