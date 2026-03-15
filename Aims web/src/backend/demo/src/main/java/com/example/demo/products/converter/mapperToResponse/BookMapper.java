package com.example.demo.products.converter.mapperToResponse;

import com.example.demo.products.dto.response.BookAuthorResponseDTO;
import com.example.demo.products.dto.response.BookResponseDTO;
import com.example.demo.products.entity.Book;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class BookMapper extends AbstractProductMapper<Book, BookResponseDTO> {

    public BookMapper() {
        super(Book.class);
    }

    @Override
    protected BookResponseDTO createDto() {
        return new BookResponseDTO();
    }

    @Override
    protected void mapSpecificFields(Book book, BookResponseDTO dto) {
        dto.setBookType(book.getBookType());
        dto.setPublisher(book.getPublisher());
        dto.setPublishDate(book.getPublishDate());
        dto.setLanguage(book.getLanguage());
        dto.setPages(book.getPages());
        dto.setGenre(book.getGenre());

        if (book.getAuthors() != null) {
            dto.setAuthors(book.getAuthors().stream().map(a -> {
                BookAuthorResponseDTO aDto = new BookAuthorResponseDTO();
                aDto.setId(a.getId());
                aDto.setName(a.getName());
                aDto.setDateOfBirth(a.getDateOfBirth());
                return aDto;
            }).collect(Collectors.toList()));
        }
    }
}