package com.project.ims.model.dto;

import lombok.Data;

@Data
public class ProductPeriodDataDTO {
    private int week;
    private int month;
    private int quantity;
    private int day; // For day-based statistics
}