package com.project.ims.model.entity;

import jakarta.persistence.*;
import lombok.Data;

/*
CREATE TABLE ProductImport (
    importID INT PRIMARY KEY,
    productID INT PRIMARY KEY,
    quantity INT,
    FOREIGN KEY (productID) REFERENCES Product(productID),
    FOREIGN KEY (importID) REFERENCES Import(importID)
);
 */

@Data
@Entity
@Table(name = "product_import")
public class ProductImport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "importID", nullable = false)
    private Import importEntity;

    @ManyToOne
    @JoinColumn(name = "productID", nullable = false)
    private Product productEntity;

    @Column(name = "quantity",nullable = false)
    private int quantity;
    @Column(name = "total_money",nullable = false)
    private Double totalMoney;
}
