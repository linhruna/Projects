package com.project.ims.service;

import com.project.ims.model.dto.ProductDTOForShow;
import com.project.ims.model.dto.StatisticsDTO;
import com.project.ims.model.dto.TransactionHistoryDTO;
import com.project.ims.model.entity.Product;
import com.project.ims.model.dto.ProductDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {

    Product addProduct(ProductDTOForShow product);
    Product findByProductId(int id);
    List<Product> filterProductsByName(String name);
    List<Product> findAll();
    Product updateProduct(int id, ProductDTOForShow productDTO);
    ProductDTOForShow deleteProduct(int id);
	List<ProductDTOForShow> findAllDTO();
	List<ProductDTOForShow> searchProducts(String query);
	List<ProductDTO> getProductsBySupplierSimple(String supplierName);
	StatisticsDTO getStatistics();
	List<TransactionHistoryDTO> getProductTransactionHistory(int productId);

}
