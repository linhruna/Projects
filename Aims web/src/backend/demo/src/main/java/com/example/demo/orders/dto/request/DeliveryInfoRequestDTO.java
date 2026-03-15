package com.example.demo.orders.dto.request;

import lombok.Data;

@Data
public class DeliveryInfoRequestDTO {
    private String receiveName;
    private String phoneNumber;
    private String email;
    private String city;
    private String ward;
    private String detailAddress;
    private String note;
}