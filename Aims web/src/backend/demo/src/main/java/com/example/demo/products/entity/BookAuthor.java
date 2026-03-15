package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

    @Getter
    @Setter
    @Entity
    @Table(name = "book_author")
    public class BookAuthor {

        @Id
        private String id;

        private String name;
        private LocalDate dateOfBirth;

        @ManyToMany(mappedBy = "authors")
        private List<Book> books;
    }
