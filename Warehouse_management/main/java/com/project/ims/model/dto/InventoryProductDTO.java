package com.project.ims.model.dto;

import lombok.Data;

@Data
public class InventoryProductDTO {
    private int productId;
    private String name;
    private int inventoryQuantity;
}