package com.project.ims.repository;

import com.project.ims.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByProductNameContaining(String name);

    List<Product> findAllByOrderByLastUpdateDesc();

    @Query("SELECT p.productID FROM Product p WHERE p.productID = :productId")
    Optional<Integer> findProductIdByProductId(@Param("productId") int productId);
    @Query("SELECT p FROM Product p WHERE " +
    	       "LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
    	       "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
    	       "CAST(p.id AS string) LIKE CONCAT('%', :query, '%')")
    	List<Product> searchProducts(@Param("query") String query);
    
    @Query("SELECT COUNT(p) FROM Product p")
    long getTotalProducts();

    @Query("SELECT COUNT(s) FROM Supplier s")
    long getTotalSuppliers();

    @Query("SELECT COUNT(i) FROM Import i")
    long getTotalImports();

    @Query("SELECT COUNT(e) FROM Export e")
    long getTotalExports();

}
