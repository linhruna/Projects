package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.DVDResponseDTO;
import com.example.demo.products.entity.DVD;
import org.springframework.stereotype.Component;

@Component
public class DVDMapper extends AbstractProductMapper<DVD, DVDResponseDTO> {

    public DVDMapper() {
        super(DVD.class);
    }

    @Override
    protected DVDResponseDTO createDto() {
        return new DVDResponseDTO();
    }

    @Override
    protected void mapSpecificFields(DVD dvd, DVDResponseDTO dto) {
        dto.setDiscType(dvd.getDiscType());
        dto.setDirector(dvd.getDirector());
        dto.setRunTime(dvd.getRunTime());
        dto.setStudio(dvd.getStudio());
        dto.setSubtitle(dvd.getSubtitle());
        dto.setReleaseDate(dvd.getReleaseDate());
        dto.setFilmType(dvd.getFilmType());
    }
}
