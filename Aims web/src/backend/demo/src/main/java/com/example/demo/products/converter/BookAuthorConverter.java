package com.example.demo.products.converter;

import com.example.demo.products.dto.response.BookAuthorResponseDTO;
import com.example.demo.products.entity.BookAuthor;
import org.springframework.stereotype.Component;

@Component
public class BookAuthorConverter {

    public BookAuthorResponseDTO toDTO(BookAuthor entity) {
        if (entity == null) {
            return null;
        }

        BookAuthorResponseDTO dto = new BookAuthorResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDateOfBirth(entity.getDateOfBirth());

        // Bạn có thể thêm các trường khác nếu cần

        return dto;
    }
}
