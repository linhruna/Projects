package com.project.ims.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.ims.model.entity.Supplier;

@Data
public class ImportDTO {
	private int importID;
//	@JsonIgnore
    private List<String> quantities;       // Danh sách số lượng của từng sản phẩm
    private Double totalMoney;        // Tổng số tiền, dùng BigDecimal để lưu trữ giá trị tiền tệ
    private int totalQuantity;            // Tổng số lượng sản phẩm
    private String supplierID;            // ID nhà cung cấp (kiểu String để phù hợp với JSON)
 //   @JsonIgnore
    private List<String> productIDs;      // Danh sách ID sản phẩm
    private List<ProductImportDTO> productImports; // Danh sách chi tiết sản phẩm nhập trong phiếu
    private LocalDateTime createDate;
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Supplier supplier;
}
