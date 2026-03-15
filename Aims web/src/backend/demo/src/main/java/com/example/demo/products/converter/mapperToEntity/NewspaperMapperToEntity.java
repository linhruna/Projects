package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Newspaper;
import com.example.demo.products.entity.Product;
import com.example.demo.products.entity.Section;
import com.example.demo.products.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NewspaperMapperToEntity implements ProductSpecificMapper {

    private final SectionRepository sectionRepository;

    @Override
    public boolean supports(Product p) {
        return p instanceof Newspaper;
    }

    @Override
    public void map(Product p, ProductRequestDTO dto) {
        Newspaper n = (Newspaper) p;
        n.setPublisher(dto.getNewspaperPublisher());
        n.setLanguage(dto.getNewspaperLanguage());
        n.setPublishDate(dto.getNewspaperPublishDate());
        n.setEdition(dto.getEdition());

        if (dto.getSectionId() != null) {
            Section section = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Section not found: " + dto.getSectionId()));
            n.setSection(section);
        }
    }
}
