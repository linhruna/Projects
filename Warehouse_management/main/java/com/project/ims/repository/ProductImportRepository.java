package com.project.ims.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.ims.model.dto.ProductStatisticsDTO2;
import com.project.ims.model.entity.ProductImport;

@Repository
public interface ProductImportRepository extends JpaRepository<ProductImport, Integer> {
	@Query("SELECT new com.project.ims.model.dto.ProductStatisticsDTO2(p.productID, p.productName, SUM(pi.quantity)) " +
		       "FROM ProductImport pi JOIN pi.productEntity p " +
		       "GROUP BY p.productID, p.productName " +
		       "ORDER BY SUM(pi.quantity) DESC LIMIT 10")
		List<ProductStatisticsDTO2> findTop10ImportedProducts();

}
