package com.project.ims.controller;

import com.project.ims.model.dto.ImportDTO;
import com.project.ims.service.ImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/imports")
public class ImportController {

    @Autowired
    private ImportService importService;

    @PostMapping("/create")
    public ResponseEntity<ImportDTO> saveImport(@RequestBody ImportDTO importDTO) {
        ImportDTO savedImport = importService.saveImport(importDTO);
        return ResponseEntity.ok(savedImport);
    }
}