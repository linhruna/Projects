package com.example.demo.products.service.impl;

import com.example.demo.products.converter.BookAuthorConverter;
import com.example.demo.products.dto.request.BookAuthorRequestDTO;
import com.example.demo.products.dto.response.BookAuthorResponseDTO;
import com.example.demo.products.entity.BookAuthor;
import com.example.demo.products.repository.BookAuthorRepository;
import com.example.demo.products.service.BookAuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BookAuthorServiceImpl implements BookAuthorService {

    private final BookAuthorRepository authorRepository;
    private final BookAuthorConverter bookAuthorConverter;

    @Override
    public BookAuthorResponseDTO create(BookAuthorRequestDTO dto) {
        BookAuthor author = new BookAuthor();
        author.setId(UUID.randomUUID().toString());
        author.setName(dto.getName());
        author.setDateOfBirth(dto.getDateOfBirth());

        author = authorRepository.save(author);
        return bookAuthorConverter.toDTO(author);
    }

    @Override
    public BookAuthorResponseDTO get(String id) {
        BookAuthor author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found: " + id));

        return bookAuthorConverter.toDTO(author);
    }

    @Override
    public BookAuthorResponseDTO update(String id, BookAuthorRequestDTO dto) {
        BookAuthor author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found: " + id));
        author.setName(dto.getName());
        author.setDateOfBirth(dto.getDateOfBirth());

        author = authorRepository.save(author);

        return bookAuthorConverter.toDTO(author);
    }

    @Override
    public void delete(String id) {
        authorRepository.deleteById(id);
    }

    @Override
    public List<BookAuthorResponseDTO> list() {
        List<BookAuthor> authors = authorRepository.findAll();

        return authors.stream()
                .map(bookAuthorConverter::toDTO)
                .collect(Collectors.toList());
    }

}