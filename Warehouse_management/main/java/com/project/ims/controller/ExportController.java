package com.project.ims.controller;

import com.project.ims.model.dto.ExportDTO;
import com.project.ims.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exports")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @PostMapping("/create")
    public ResponseEntity<ExportDTO> saveExport(@RequestBody ExportDTO exportDTO) {
        ExportDTO savedExport = exportService.saveExport(exportDTO);
        return ResponseEntity.ok(savedExport);
    }
}
