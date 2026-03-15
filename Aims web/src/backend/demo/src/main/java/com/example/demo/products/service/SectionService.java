package com.example.demo.products.service;

import com.example.demo.products.dto.request.SectionRequestDTO;
import com.example.demo.products.dto.response.SectionResponseDTO;

import java.util.List;

public interface SectionService {
    SectionResponseDTO create(SectionRequestDTO dto);
    SectionResponseDTO get(String id);
    SectionResponseDTO update(String id, SectionRequestDTO dto);
    void delete(String id);
    List<SectionResponseDTO> list();
}