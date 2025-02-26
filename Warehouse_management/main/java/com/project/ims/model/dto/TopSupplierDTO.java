package com.project.ims.model.dto;

import lombok.Data;

@Data
public class TopSupplierDTO {
    private int supplierId;
    private String supplierName;
    private long totalImports;
    private long totalProducts;
}