package com.example.demo.products.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookAuthorRequestDTO {
    private String name;
    private LocalDate dateOfBirth;
}