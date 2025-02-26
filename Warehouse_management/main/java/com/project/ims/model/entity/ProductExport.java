package com.project.ims.model.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "product_export")
public class ProductExport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "exportID", nullable = false)
    private Export exportEntity;

    @ManyToOne
    @JoinColumn(name = "productID", nullable = false)
    private Product productEntity;

    @Column(nullable = false)
    private int quantity;
    @Column(name = "total_money",nullable = false)
    private Double totalMoney;
}
