package com.example.demo.products.factory;

import org.springframework.stereotype.Component;
import com.example.demo.products.dto.request.ProductRequestDTO;
import com.example.demo.products.entity.CD;
import com.example.demo.products.entity.Product;

@Component
public class CDFactory implements ProductFactory {
    @Override
    public String getCategory() {
        return "CD";
    }

    @Override
    public Product create(ProductRequestDTO dto) {
        CD cd = new CD();
        // populate cd from dto as needed
        return cd;
    }
}