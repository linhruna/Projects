package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "book")
@PrimaryKeyJoinColumn(name = "id")
public class Book extends Product {

    private String bookType;
    private String publisher;
    private LocalDate publishDate;
    private String language;
    private Integer pages; // Số trang
    private String genre; // Thể loại

    // Many-to-Many
    @ManyToMany
    @JoinTable(name = "book_author_mapping", joinColumns = @JoinColumn(name = "book_id"), inverseJoinColumns = @JoinColumn(name = "author_id"))
    private List<BookAuthor> authors;

}
