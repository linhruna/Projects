package com.project.ims.model.dto;

import lombok.Data;

@Data
public class ProductExportDTO {
    private int productID;
    private String productName;
    private int quantity;
    private Double totalMoney;
    private Double price;
}
