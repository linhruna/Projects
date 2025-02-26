package com.project.ims.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.ims.model.entity.Partner;
import com.project.ims.model.entity.Supplier;

@Data
public class ExportDTO {
    private int exportID;
    private int totalQuantity;
    private Double totalMoney;
    private String partnerID;
  //  @JsonIgnore
    private List<String> productIDs; // Các sản phẩm liên quan
  //  @JsonIgnore
    private List<String> quantities; // Số lượng của từng sản phẩm
    private List<ProductExportDTO> productExports; // Danh sách chi tiết sản phẩm nhập trong phiếu
    private LocalDateTime createDate;
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Partner partner;
}
