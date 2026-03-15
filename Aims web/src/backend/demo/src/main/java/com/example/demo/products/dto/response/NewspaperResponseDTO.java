package com.example.demo.products.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NewspaperResponseDTO extends ProductResponseDTO {
    private String publisher;
    private String language;
    private LocalDate publishDate;
    private String edition;
    private SectionResponseDTO section;
}
