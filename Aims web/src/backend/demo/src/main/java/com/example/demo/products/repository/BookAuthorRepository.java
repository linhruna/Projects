package com.example.demo.products.repository;

import com.example.demo.products.entity.BookAuthor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookAuthorRepository extends JpaRepository<BookAuthor, String> {
}