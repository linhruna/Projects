package com.example.demo.products.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CDResponseDTO extends ProductResponseDTO {
    private String artist;
    private String recordLabel;
    private String musicType;
    private LocalDate releaseDate;
    private List<TrackResponseDTO> tracks;
}
