package com.example.demo.products.factory;

import org.springframework.stereotype.Component;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.DVD;
import com.example.demo.products.entity.Product;

@Component
public class DVDFactory implements ProductFactory {
    @Override
    public String getCategory() {
        return "DVD";
    }

    @Override
    public Product create(ProductRequestDTO dto) {
        DVD dvd = new DVD();
        // populate dvd from dto as needed
        return dvd;
    }
}