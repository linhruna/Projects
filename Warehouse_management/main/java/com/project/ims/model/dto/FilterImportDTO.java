package com.project.ims.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class FilterImportDTO {
    private int importID;
    private String supplierName;
    private Double totalMoney;
    private int totalQuantity;
    private LocalDateTime createDate;
    private List<String> productIDs;      // Danh sách ID sản phẩm
}
