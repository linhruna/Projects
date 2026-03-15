package com.example.demo.products.controller;

import com.example.demo.products.dto.request.SectionRequestDTO;
import com.example.demo.products.dto.response.SectionResponseDTO;
import com.example.demo.products.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @PostMapping
    public ResponseEntity<SectionResponseDTO> createSection(@RequestBody SectionRequestDTO dto) {
        SectionResponseDTO createdSection = sectionService.create(dto);
        return new ResponseEntity<>(createdSection, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionResponseDTO> getSection(@PathVariable String id) {
        SectionResponseDTO sectionDTO = sectionService.get(id);
        return ResponseEntity.ok(sectionDTO);
    }

    @GetMapping
    public ResponseEntity<List<SectionResponseDTO>> listSections() {
        List<SectionResponseDTO> sections = sectionService.list();
        return ResponseEntity.ok(sections);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionResponseDTO> updateSection(@PathVariable String id, @RequestBody SectionRequestDTO dto) {
        SectionResponseDTO updatedSection = sectionService.update(id, dto);
        return ResponseEntity.ok(updatedSection);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable String id) {
        sectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}