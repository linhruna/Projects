package com.example.demo.orders.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "delivery_info")
public class DeliveryInfo {

    @Id
    private String id;

    private String receiveName;
    private String phoneNumber;
    private String email;
    private String city;
    private String ward;
    private String detailAddress;
    private String note;
}
