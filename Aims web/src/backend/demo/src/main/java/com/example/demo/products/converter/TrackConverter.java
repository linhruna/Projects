package com.example.demo.products.converter;

import com.example.demo.products.dto.response.TrackResponseDTO;
import com.example.demo.products.entity.Track;
import org.springframework.stereotype.Component;

@Component
public class TrackConverter {


    public TrackResponseDTO toDTO(Track entity) {
        if (entity == null) {
            return null;
        }

        TrackResponseDTO dto = new TrackResponseDTO();


        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setLength(entity.getLength());



        return dto;
    }
}
