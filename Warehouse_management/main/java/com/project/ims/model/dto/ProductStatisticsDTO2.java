package com.project.ims.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductStatisticsDTO2 {
    private int productID;
    private String name;
    private long totalQuantity;
}
