package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.CDResponseDTO;
import com.example.demo.products.dto.response.TrackResponseDTO;
import com.example.demo.products.entity.CD;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class CDMapper extends AbstractProductMapper<CD, CDResponseDTO> {

    public CDMapper() {
        super(CD.class);
    }

    @Override
    protected CDResponseDTO createDto() {
        return new CDResponseDTO();
    }

    @Override
    protected void mapSpecificFields(CD cd, CDResponseDTO dto) {
        dto.setArtist(cd.getArtist());
        dto.setRecordLabel(cd.getRecordLabel());
        dto.setMusicType(cd.getMusicType());
        dto.setReleaseDate(cd.getReleaseDate());

        if (cd.getTracks() != null) {
            dto.setTracks(cd.getTracks().stream().map(t -> {
                TrackResponseDTO tDto = new TrackResponseDTO();
                tDto.setId(t.getId());
                tDto.setTitle(t.getTitle());
                tDto.setLength(t.getLength());
                return tDto;
            }).collect(Collectors.toList()));
        }
    }
}