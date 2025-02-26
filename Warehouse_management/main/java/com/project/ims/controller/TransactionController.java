package com.project.ims.controller;

import com.project.ims.model.dto.ImportDTO;
import com.project.ims.service.ExportService;
import com.project.ims.service.ImportService;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private ImportService importService;
    @Autowired
    private ExportService exportService;

    @GetMapping("/{type}/{id}")
    public ResponseEntity<?> getTransactionDetails(@PathVariable String type, @PathVariable int id) {
        if ("import".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(importService.getImportDetails(id));
        } else if ("export".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(exportService.getExportDetails(id));
        } else {
            return ResponseEntity.badRequest().body("Invalid transaction type");
        }
    }
    @GetMapping("/filter")
    public ResponseEntity<?> filterTransactions(
            @RequestParam(required = true) String type,  
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false) Integer partnerId,
            @RequestParam(required = false) Integer minProductQuantity,
            @RequestParam(required = false) Integer maxProductQuantity) {

        // Kiểm tra nếu startDate hoặc endDate là "Invalid date"
        LocalDateTime parsedStartDate = parseDate(startDate, LocalDateTime.of(2024, Month.JANUARY, 1, 0, 0));
        LocalDateTime parsedEndDate = parseDate(endDate, LocalDateTime.now());

        // Kiểm tra kiểu giao dịch hợp lệ
        if (type == null || (!"import".equalsIgnoreCase(type) && !"export".equalsIgnoreCase(type))) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid transaction type"));
        }

        // Kiểm tra minProductQuantity không lớn hơn maxProductQuantity
        if (minProductQuantity != null && maxProductQuantity != null && minProductQuantity > maxProductQuantity) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "minProductQuantity cannot be greater than maxProductQuantity"));
        }

        // Gọi service tương ứng
        if ("import".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(importService.filterImports(parsedStartDate, parsedEndDate, supplierId, minProductQuantity, maxProductQuantity));
        } else {
            return ResponseEntity.ok(exportService.filterExports(parsedStartDate, parsedEndDate, partnerId, minProductQuantity, maxProductQuantity));
        }
    }
 // Hàm chuyển đổi ngày hợp lệ hoặc dùng giá trị mặc định
    private LocalDateTime parseDate(String dateStr, LocalDateTime defaultDate) {
        if (dateStr == null || "Invalid date".equalsIgnoreCase(dateStr.trim())) {
            return defaultDate;
        }
        try {
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            return defaultDate;
        }
    }

}