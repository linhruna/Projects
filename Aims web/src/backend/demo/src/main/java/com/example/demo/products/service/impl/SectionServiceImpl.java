package com.example.demo.products.service.impl;

import com.example.demo.products.converter.SectionConverter; // 1. Import Converter
import com.example.demo.products.dto.request.SectionRequestDTO;
import com.example.demo.products.dto.response.SectionResponseDTO; // 2. Import DTO Response
import com.example.demo.products.entity.Section;
import com.example.demo.products.repository.SectionRepository;
import com.example.demo.products.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SectionServiceImpl implements SectionService {

    private final SectionRepository sectionRepository;
    private final SectionConverter sectionConverter;


    @Override
    public SectionResponseDTO create(SectionRequestDTO dto) {
        Section section = new Section();
        section.setId(UUID.randomUUID().toString());
        section.setTitle(dto.getTitle());
        section.setDescription(dto.getDescription());

        section = sectionRepository.save(section);

        return sectionConverter.toDTO(section);
    }

    @Override
    public SectionResponseDTO get(String id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found: " + id));


        return sectionConverter.toDTO(section);
    }

    @Override
    public SectionResponseDTO update(String id, SectionRequestDTO dto) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found: " + id));

        section.setTitle(dto.getTitle());
        section.setDescription(dto.getDescription());

        section = sectionRepository.save(section);

        return sectionConverter.toDTO(section);
    }

    @Override
    public void delete(String id) {
        sectionRepository.deleteById(id);
    }

    @Override
    public List<SectionResponseDTO> list() {
        List<Section> sections = sectionRepository.findAll();

        return sections.stream()
                .map(sectionConverter::toDTO)
                .collect(Collectors.toList());
    }
}