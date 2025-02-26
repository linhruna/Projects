package com.project.ims.repository;

import com.project.ims.model.entity.Import;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportRepository extends JpaRepository<Import, Integer> {
    @Query("SELECT i FROM Import i WHERE i.createDate BETWEEN :startDate AND :endDate " +
            "AND (:supplierId IS NULL OR i.supplier.supplierID = :supplierId) " +
            "AND (:minProductQuantity IS NULL OR i.totalQuantity >= :minProductQuantity) " +
            "AND (:maxProductQuantity IS NULL OR i.totalQuantity <= :maxProductQuantity)"+ "ORDER BY i.createDate DESC")
     List<Import> findFilteredImports(LocalDateTime startDate, LocalDateTime endDate, Integer supplierId, Integer minProductQuantity, Integer maxProductQuantity);
    @Query("SELECT i FROM Import i JOIN i.productImports pi WHERE pi.productEntity.id = :productId")
    List<Import> findByProductId(int productId);
 }