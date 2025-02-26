package com.project.ims.model.dto;

import com.project.ims.model.entity.Supplier;
import lombok.Data;

@Data
public class SupplierDTOForShow {
    private int supplierID;
    private String name;
    private String contactNumber;
    private String address;

    public static SupplierDTOForShow fromEntity(Supplier supplier) {
        SupplierDTOForShow dto = new SupplierDTOForShow();
        dto.setSupplierID(supplier.getSupplierID());
        dto.setName(supplier.getName());
        dto.setContactNumber(supplier.getContactNumber());
        dto.setAddress(supplier.getAddress());
        return dto;
    }
}