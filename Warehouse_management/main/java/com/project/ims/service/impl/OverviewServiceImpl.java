package com.project.ims.service.impl;

import com.project.ims.model.dto.InventoryProductDTO;
import com.project.ims.model.dto.ProductStatisticsDTO2;
import com.project.ims.model.dto.TopSupplierDTO;
import com.project.ims.model.entity.Product;
import com.project.ims.model.entity.Supplier;
import com.project.ims.repository.ProductExportRepository;
import com.project.ims.repository.ProductImportRepository;
import com.project.ims.repository.ProductRepository;
import com.project.ims.repository.SupplierRepository;
import com.project.ims.service.OverviewService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OverviewServiceImpl implements OverviewService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private ProductImportRepository productImportRepository;
    @Autowired
    private ProductExportRepository productExportRepository;

    @Override
    public List<InventoryProductDTO> getTopInventoryProducts(String type, int limit) {
        String jpql = "SELECT p FROM Product p ORDER BY p.quantity " + 
                     (type.equals("most") ? "DESC" : "ASC");
        
        TypedQuery<Product> query = entityManager.createQuery(jpql, Product.class)
                                               .setMaxResults(limit);
        
        List<Product> products = query.getResultList();
        
        return products.stream()
                .map(this::convertToInventoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopSupplierDTO> getTopSuppliersByProducts(int limit) {
        String jpql = "SELECT s.supplierID, s.name, COUNT(sp.productid) as productCount " +
                     "FROM supplier s " +
                     "LEFT JOIN supplier_product sp ON s.supplierID = sp.supplierid " +
                     "GROUP BY s.supplierID, s.name " +
                     "ORDER BY productCount DESC";
        
        List<Object[]> results = entityManager.createNativeQuery(jpql)
                                            .setMaxResults(limit)
                                            .getResultList();
        
        return results.stream()
                .map(result -> {
                    TopSupplierDTO dto = new TopSupplierDTO();
                    dto.setSupplierId(((Number) result[0]).intValue());
                    dto.setSupplierName((String) result[1]);
                    dto.setTotalProducts(((Number) result[2]).longValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TopSupplierDTO> getTopSuppliersByImports(int limit) {
        String jpql = "SELECT s.supplierID, s.name, COUNT(i.importID) as importCount " +
                     "FROM supplier s " +
                     "LEFT JOIN import i ON s.supplierID = i.supplierID " +
                     "GROUP BY s.supplierID, s.name " +
                     "ORDER BY importCount DESC";
        
        List<Object[]> results = entityManager.createNativeQuery(jpql)
                                            .setMaxResults(limit)
                                            .getResultList();
        
        return results.stream()
                .map(result -> {
                    TopSupplierDTO dto = new TopSupplierDTO();
                    dto.setSupplierId(((Number) result[0]).intValue());
                    dto.setSupplierName((String) result[1]);
                    dto.setTotalImports(((Number) result[2]).longValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private InventoryProductDTO convertToInventoryDTO(Product product) {
        InventoryProductDTO dto = new InventoryProductDTO();
        dto.setProductId(product.getProductID());
        dto.setName(product.getProductName().trim());
        dto.setInventoryQuantity(product.getQuantity());
        return dto;
    }
    @Override
    public List<ProductStatisticsDTO2> getTop10ImportedProducts() {
        return productImportRepository.findTop10ImportedProducts();
    }
    @Override
    public List<ProductStatisticsDTO2> getTop10ExportedProducts() {
        return productExportRepository.findTop10ExportedProducts();
    }
}