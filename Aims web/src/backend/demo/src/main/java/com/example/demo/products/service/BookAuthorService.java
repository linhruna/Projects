package com.example.demo.products.service;

import com.example.demo.products.dto.request.BookAuthorRequestDTO;
import com.example.demo.products.dto.response.BookAuthorResponseDTO;

import java.util.List;

public interface BookAuthorService {
    BookAuthorResponseDTO create(BookAuthorRequestDTO dto);
    BookAuthorResponseDTO get(String id);
    BookAuthorResponseDTO update(String id, BookAuthorRequestDTO dto);
    void delete(String id);
    List<BookAuthorResponseDTO> list();


}