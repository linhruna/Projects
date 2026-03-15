package com.example.demo.products.converter;

import com.example.demo.products.dto.response.SectionResponseDTO;
import com.example.demo.products.entity.Section;
import org.springframework.stereotype.Component;

@Component
public class SectionConverter {

    public SectionResponseDTO toDTO(Section entity) {
        if (entity == null) {
            return null;
        }

        SectionResponseDTO dto = new SectionResponseDTO();

        // Map các trường từ Entity sang DTO
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());

        return dto;
    }
}
