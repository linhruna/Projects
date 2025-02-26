package com.project.ims.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

/*
CREATE TABLE Product (
    productID INT PRIMARY KEY,
    productName VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(10, 2),
    unitCal VARCHAR(50)
);
 */
@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Table(name = "product")
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int productID;

    @Column(name = "product_name", nullable = false)
    @NonNull
    private String productName;

    @Column(name = "category", nullable = false)
    @NonNull
    private String category;

    @Column(name = "price", nullable = false)
    @NonNull
    private Double price;
    
    @Column(name = "unit_cal", nullable = false)
    @NonNull
    private String unitCal;

    @Column(name = "last_update", nullable = true)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Date lastUpdate;

    
    @Column(name = "quantity", nullable = false, columnDefinition = "int default 1")
    @NonNull
    private Integer quantity;
    @JsonIgnore
    @OneToMany(mappedBy = "productEntity",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductImport> productImports;
    @JsonIgnore
    @OneToMany(mappedBy = "productEntity",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductExport> productExports;
    @JsonIgnore
    @ManyToMany(mappedBy = "products", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Supplier> suppliers;
}
