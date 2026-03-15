package com.example.demo.products.repository;

import com.example.demo.products.entity.Book;
import com.example.demo.products.entity.Newspaper;
import com.example.demo.products.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(String Category);

    List<Book> findByAuthors_Id(String authorId);

    List<Newspaper> findBySection_Id(String sectionId);
}
