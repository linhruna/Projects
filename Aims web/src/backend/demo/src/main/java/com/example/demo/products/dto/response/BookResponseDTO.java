package com.example.demo.products.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class BookResponseDTO extends ProductResponseDTO {
    private String bookType;
    private String publisher;
    private LocalDate publishDate;
    private String language;
    private Integer pages; // Số trang
    private String genre; // Thể loại
    private List<BookAuthorResponseDTO> authors;
}