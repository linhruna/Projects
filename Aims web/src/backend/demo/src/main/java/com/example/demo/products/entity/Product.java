package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "category") // đổi tên cột discriminator từ product_type -> category
@Table(name = "products")
public abstract class Product {

    @Id
    private String id;

    private String title;
    // private String category; <-- xóa cột cũ
    private Long originalValue;
    private Long currentPrice;
    private Integer quantity;
    private String imageURL;
    private String createdBy;
    private Double weight; // Trọng lượng sản phẩm tính bằng kg

    @Column(name = "category", insertable = false, updatable = false)
    private String category; // ánh xạ field category với cột category
}
