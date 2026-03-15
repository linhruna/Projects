package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.CD;
import com.example.demo.products.entity.Product;
import com.example.demo.products.entity.Track;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CDMapperToEntity implements ProductSpecificMapper {

    @Override
    public boolean supports(Product p) {
        return p instanceof CD;
    }

    @Override
    public void map(Product p, ProductRequestDTO dto) {
        CD cd = (CD) p;
        if (dto.getArtist() != null) {
            cd.setArtist(dto.getArtist());
        }
        if (dto.getRecordLabel() != null) {
            cd.setRecordLabel(dto.getRecordLabel());
        }
        if (dto.getMusicType() != null) {
            cd.setMusicType(dto.getMusicType());
        }
        if (dto.getCdReleaseDate() != null) {
            cd.setReleaseDate(dto.getCdReleaseDate());
        }

        if (dto.getTrackDetails() != null) {
            List<Track> tracks = dto.getTrackDetails().stream()
                    .map(trackDto -> {
                        Track t = new Track();
                        t.setId(UUID.randomUUID().toString());
                        t.setTitle(trackDto.getTitle() != null ? trackDto.getTitle() : "Unknown Track");
                        t.setLength(trackDto.getLength() != null ? trackDto.getLength() : "0:00");
                        t.setCd(cd); // Parent reference
                        return t;
                    })
                    .collect(Collectors.toList());

            if (cd.getTracks() == null) {
                cd.setTracks(tracks);
            } else {
                cd.getTracks().clear();
                cd.getTracks().addAll(tracks);
            }
        }
    }
}