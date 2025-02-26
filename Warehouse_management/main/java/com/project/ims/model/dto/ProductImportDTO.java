package com.project.ims.model.dto;

import lombok.Data;

@Data
public class ProductImportDTO {
	  private String productName;
    private int productID;
    private int quantity;
    private Double totalMoney;
    private Double price;
}