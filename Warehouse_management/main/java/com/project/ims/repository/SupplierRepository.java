package com.project.ims.repository;

import com.project.ims.model.entity.Supplier;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
	List<Supplier> findByNameContaining(String name);  
	Optional<Supplier> findBySupplierID(Long supplierID);
	Optional<Supplier> findByName(String name);
	
	// Tìm kiếm nhà cung cấp theo tên
}

