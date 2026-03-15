package com.example.demo.products.converter.mapperToEntity;

import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Book;
import com.example.demo.products.entity.BookAuthor;
import com.example.demo.products.entity.Product;
import com.example.demo.products.repository.BookAuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookMapperToEntity implements ProductSpecificMapper {

    private final BookAuthorRepository bookAuthorRepository;

    @Override
    public boolean supports(Product p) {
        return p instanceof Book;
    }

    @Override
    public void map(Product p, ProductRequestDTO dto) {
        Book book = (Book) p;
        book.setPublisher(dto.getPublisher());
        book.setLanguage(dto.getLanguage());
        book.setPublishDate(dto.getPublishDate());
        book.setBookType(dto.getBookType());
        book.setPages(dto.getPages());
        book.setGenre(dto.getGenre());

        if (dto.getAuthorIds() != null && !dto.getAuthorIds().isEmpty()) {
            List<BookAuthor> authors = dto.getAuthorIds().stream()
                    .map(id -> bookAuthorRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Author not found: " + id)))
                    .collect(Collectors.toList());
            book.setAuthors(authors);
        }
    }
}