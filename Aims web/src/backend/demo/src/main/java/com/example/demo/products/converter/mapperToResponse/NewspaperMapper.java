package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.NewspaperResponseDTO;
import com.example.demo.products.dto.response.SectionResponseDTO;
import com.example.demo.products.entity.Newspaper;
import org.springframework.stereotype.Component;

@Component
public class NewspaperMapper extends AbstractProductMapper<Newspaper, NewspaperResponseDTO> {

    public NewspaperMapper() {
        super(Newspaper.class);
    }

    @Override
    protected NewspaperResponseDTO createDto() {
        return new NewspaperResponseDTO();
    }

    @Override
    protected void mapSpecificFields(Newspaper news, NewspaperResponseDTO dto) {
        dto.setPublisher(news.getPublisher());
        dto.setLanguage(news.getLanguage());
        dto.setPublishDate(news.getPublishDate());
        dto.setEdition(news.getEdition());

        if (news.getSection() != null) {
            SectionResponseDTO sDto = new SectionResponseDTO();
            sDto.setId(news.getSection().getId());
            sDto.setTitle(news.getSection().getTitle());
            sDto.setDescription(news.getSection().getDescription());
            dto.setSection(sDto);
        }
    }
}