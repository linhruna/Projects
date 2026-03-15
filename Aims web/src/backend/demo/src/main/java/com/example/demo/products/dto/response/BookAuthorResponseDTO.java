package com.example.demo.products.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookAuthorResponseDTO {
    private String id;
    private String name;
    private LocalDate dateOfBirth;
}