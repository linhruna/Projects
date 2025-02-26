package com.project.ims.repository;

import com.project.ims.model.dto.ProductStatisticsDTO2;
import com.project.ims.model.entity.ProductExport;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductExportRepository extends JpaRepository<ProductExport, Integer> {
    // Các phương thức tùy chỉnh có thể được thêm vào đây nếu cần thiết
	@Query("SELECT new com.project.ims.model.dto.ProductStatisticsDTO2(p.productID, p.productName, SUM(pe.quantity)) " +
		       "FROM ProductExport pe JOIN pe.productEntity p " +
		       "GROUP BY p.productID, p.productName " +
		       "ORDER BY SUM(pe.quantity) DESC LIMIT 10")
		List<ProductStatisticsDTO2> findTop10ExportedProducts();

}
