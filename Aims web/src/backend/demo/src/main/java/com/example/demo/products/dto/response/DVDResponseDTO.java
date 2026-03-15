package com.example.demo.products.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DVDResponseDTO extends ProductResponseDTO {
    private String discType;
    private String director;
    private Integer runTime;
    private String studio;
    private String subtitle;
    private LocalDate releaseDate;
    private String filmType;
}
