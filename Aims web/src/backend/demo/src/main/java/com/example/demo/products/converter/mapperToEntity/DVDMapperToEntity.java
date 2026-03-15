package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.DVD;
import com.example.demo.products.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class DVDMapperToEntity implements ProductSpecificMapper {

    @Override
    public boolean supports(Product p) {
        return p instanceof DVD;
    }

    @Override
    public void map(Product p, ProductRequestDTO dto) {
        DVD dvd = (DVD) p;
        dvd.setDiscType(dto.getDiscType());
        dvd.setDirector(dto.getDirector());
        dvd.setRunTime(dto.getRunTime());
        dvd.setStudio(dto.getStudio());
        dvd.setSubtitle(dto.getSubtitle());
        dvd.setReleaseDate(dto.getDvdReleaseDate());
        dvd.setFilmType(dto.getFilmType());
    }
}