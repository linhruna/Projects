package com.project.ims.repository;

import com.project.ims.model.entity.Export;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportRepository extends JpaRepository<Export, Integer> {
    @Query("SELECT e FROM Export e WHERE e.createDate BETWEEN :startDate AND :endDate " +
            "AND (:partnerId IS NULL OR e.partner.partnerID = :partnerId) " +
            "AND (:minProductQuantity IS NULL OR e.totalQuantity >= :minProductQuantity) " +
            "AND (:maxProductQuantity IS NULL OR e.totalQuantity <= :maxProductQuantity)" + "ORDER BY e.createDate DESC")
     List<Export> findFilteredExports(LocalDateTime startDate, LocalDateTime endDate, Integer partnerId, Integer minProductQuantity, Integer maxProductQuantity);
    @Query("SELECT e FROM Export e JOIN e.productExports pe WHERE pe.productEntity.id = :productId")
    List<Export> findByProductId(int productId);
}

