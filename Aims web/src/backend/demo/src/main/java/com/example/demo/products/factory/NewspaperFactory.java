package com.example.demo.products.factory;


import org.springframework.stereotype.Component;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.Newspaper;
import com.example.demo.products.entity.Product;

@Component
public class NewspaperFactory implements ProductFactory {
    @Override
    public String getCategory() {
        return "NEWSPAPER";
    }

    @Override
    public Product create(ProductRequestDTO dto) {
        Newspaper newspaper = new Newspaper();
        // populate newspaper from dto as needed
        return newspaper;
    }
}