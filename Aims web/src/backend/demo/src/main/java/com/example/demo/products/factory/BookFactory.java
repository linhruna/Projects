package com.example.demo.products.factory;

import org.springframework.stereotype.Component;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Book;
import com.example.demo.products.entity.Product;

@Component
public class BookFactory implements ProductFactory {
    @Override
    public String getCategory() {
        return "BOOK";
    }

    @Override
    public Product create(ProductRequestDTO dto) {
        Book book = new Book();
        // populate book from dto as needed, e.g. book.setTitle(dto.getName());
        return book;
    }
}