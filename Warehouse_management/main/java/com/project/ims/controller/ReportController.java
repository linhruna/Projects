package com.project.ims.controller;

import com.project.ims.model.dto.PeriodStatisticsDTO;
import com.project.ims.model.dto.ProductStatisticsDTO;
import com.project.ims.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Year;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/statistics-by-period")
    public ResponseEntity<PeriodStatisticsDTO> getStatisticsByPeriod(
            @RequestParam String type,
            @RequestParam String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        // Kiểm tra type hợp lệ
        if (!type.equalsIgnoreCase("import") && !type.equalsIgnoreCase("export")) {
            return ResponseEntity.badRequest().body(null); // Hoặc trả về lỗi phù hợp hơn
        }

        // Kiểm tra period hợp lệ
        if (!period.equalsIgnoreCase("day") && !period.equalsIgnoreCase("week") &&
            !period.equalsIgnoreCase("month") && !period.equalsIgnoreCase("year")) {
            return ResponseEntity.badRequest().body(null);
        }

        // Nếu year không được truyền vào, lấy năm hiện tại
        if (year == null) {
            year = Year.now().getValue();
        }

        // Nếu period là "day" hoặc "week", cần kiểm tra month
        if ((period.equalsIgnoreCase("day") || period.equalsIgnoreCase("week")) && month == null) {
            return ResponseEntity.badRequest().body(null);
        }

        PeriodStatisticsDTO statistics = reportService.getStatisticsByPeriod(type, period, year, month);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics-by-product")
    public ResponseEntity<ProductStatisticsDTO> getStatisticsByProduct(
            @RequestParam String type,
            @RequestParam int productId,
            @RequestParam String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        // Log or print the period value for debugging
        System.out.println("Received period: " + period);

        if (year == null) {
            year = Year.now().getValue();
        }

        // Check if the period is "day" and month is required
        if ("day".equals(period) && month == null) {
            return ResponseEntity.badRequest().body(null); // Return an error if month is required for days
        }

        ProductStatisticsDTO statistics = reportService.getStatisticsByProduct(type, productId, period, year, month);
        return ResponseEntity.ok(statistics);
    }

}
