package com.project.ims.model.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductStatisticsDTO {
    private String type;
    private int productId;
    private String period;
    private int year;
    private Integer month;
    private List<ProductPeriodDataDTO> data;
}
