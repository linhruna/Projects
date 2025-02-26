package com.project.ims.controller;

import com.project.ims.model.dto.ProductDTOForShow;
import com.project.ims.model.dto.TransactionHistoryDTO;
import com.project.ims.model.entity.Product;
import com.project.ims.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/insert")
    public Product createProduct(@RequestBody  ProductDTOForShow product) {
        return productService.addProduct(product);
    }

    @GetMapping("/search")
    public Product findProductById(@RequestParam int id) {
        return productService.findByProductId(id);
    }

    @GetMapping("/search/{productID}")
    public Product findProductById2(@PathVariable int productID) {
        return productService.findByProductId(productID);
    }

    @GetMapping("/filter")
    public List<Product> findProductByName(@RequestParam String name) {
         return productService.filterProductsByName(name);
    }

    @GetMapping("/get-all")
    public List<ProductDTOForShow> getAll() {
    	
        return productService.findAllDTO();
    }


    @PutMapping("/update/{productID}")
    public Product updateProduct(@PathVariable int productID, @RequestBody ProductDTOForShow productDTO) {
        return productService.updateProduct(productID, productDTO);
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable int productId) {
        try {
            ProductDTOForShow deletedProduct = productService.deleteProduct(productId);
            return ResponseEntity.ok(deletedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/search1")
    public ResponseEntity<List<ProductDTOForShow>> searchProducts(@RequestParam("query") String query) {
        try {
            List<ProductDTOForShow> result = productService.searchProducts(query);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @GetMapping("/{productId}/history")
    public ResponseEntity<List<TransactionHistoryDTO>> getProductTransactionHistory(@PathVariable int productId) {
        List<TransactionHistoryDTO> history = productService.getProductTransactionHistory(productId);
        return ResponseEntity.ok(history);
    }
}