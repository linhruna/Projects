package com.example.demo.products.controller;

import com.example.demo.products.dto.request.BookAuthorRequestDTO;
import com.example.demo.products.dto.response.BookAuthorResponseDTO;
import com.example.demo.products.service.BookAuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class BookAuthorController {

    private final BookAuthorService authorService;

    @PostMapping
    public ResponseEntity<BookAuthorResponseDTO> createAuthor(@RequestBody BookAuthorRequestDTO dto) {
        BookAuthorResponseDTO createdAuthor = authorService.create(dto);
        return new ResponseEntity<>(createdAuthor, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookAuthorResponseDTO> getAuthor(@PathVariable String id) {
        BookAuthorResponseDTO authorDTO = authorService.get(id);
        return ResponseEntity.ok(authorDTO);
    }

    @GetMapping
    public ResponseEntity<List<BookAuthorResponseDTO>> listAuthors() {
        List<BookAuthorResponseDTO> authors = authorService.list();
        return ResponseEntity.ok(authors);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookAuthorResponseDTO> updateAuthor(@PathVariable String id, @RequestBody BookAuthorRequestDTO dto) {
        BookAuthorResponseDTO updatedAuthor = authorService.update(id, dto);
        return ResponseEntity.ok(updatedAuthor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable String id) {
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}