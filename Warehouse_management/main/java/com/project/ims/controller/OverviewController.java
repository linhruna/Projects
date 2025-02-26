package com.project.ims.controller;

import com.project.ims.model.dto.InventoryProductDTO;
import com.project.ims.model.dto.ProductStatisticsDTO2;
import com.project.ims.model.dto.StatisticsDTO;
import com.project.ims.model.dto.TopSupplierDTO;
import com.project.ims.service.OverviewService;
import com.project.ims.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overview")
public class OverviewController {

    @Autowired
    private OverviewService overviewService;
    @Autowired
    private ProductService productService;

    @GetMapping("/top-inventory")
    public ResponseEntity<List<InventoryProductDTO>> getTopInventory(
            @RequestParam String type,
            @RequestParam(defaultValue = "5") int limit) {
        List<InventoryProductDTO> products = overviewService.getTopInventoryProducts(type, limit);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/top-suppliers-by-products")
    public ResponseEntity<List<TopSupplierDTO>> getTopSuppliersByProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopSupplierDTO> suppliers = overviewService.getTopSuppliersByProducts(limit);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/top-suppliers-by-imports")
    public ResponseEntity<List<TopSupplierDTO>> getTopSuppliersByImports(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopSupplierDTO> suppliers = overviewService.getTopSuppliersByImports(limit);
        return ResponseEntity.ok(suppliers);
    }
    @GetMapping("/top-products")
    public ResponseEntity<List<ProductStatisticsDTO2>> getTopProducts(@RequestParam String type) {
        if ("import".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(overviewService.getTop10ImportedProducts());
        } else if ("export".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(overviewService.getTop10ExportedProducts());
        } else {
            return ResponseEntity.badRequest().build(); // Trả về lỗi 400 nếu type không hợp lệ
        }
    }
    @GetMapping("/stat")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        return ResponseEntity.ok(productService.getStatistics());
    }
}