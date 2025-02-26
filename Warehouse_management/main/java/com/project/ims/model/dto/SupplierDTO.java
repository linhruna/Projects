package com.project.ims.model.dto;

import com.project.ims.model.entity.Supplier;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)

public class SupplierDTO {
    private int supplierID;
    private String name;
   

    public static SupplierDTO fromEntity(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setSupplierID(supplier.getSupplierID());
        dto.setName(supplier.getName());
       
        return dto;
    }
}