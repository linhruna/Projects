package com.project.ims.service;

import com.project.ims.model.dto.ProductDTO;
import com.project.ims.model.dto.SupplierDTO;
import com.project.ims.model.dto.SupplierDTOForAddProduct;
import com.project.ims.model.dto.SupplierDTOForShow;
import com.project.ims.model.dto.SupplierProductDTOForShow;
import com.project.ims.model.entity.Product;
import com.project.ims.model.entity.Supplier;

import java.util.List;
import java.util.Optional;

public interface SupplierService {
    List<SupplierDTOForShow> findAllDTO();
    List<SupplierDTOForShow> findByNameContainingDTO(String name);
    List<SupplierProductDTOForShow> getProductsBySupplier(int supplierId);
    void addProductToSupplier(int supplierId, int productId);
    void addProductToSupplier(SupplierDTOForAddProduct request);
	Supplier addSupplier(Supplier supplier);
	  List<SupplierDTO> findAllSimpleDTO();
	List<ProductDTO> getProductsBySupplierSimple(String supplierName);
	Optional<Supplier> findbyidSupplier(int supplierID);
	void removeProductFromSupplier(int supplierId, int productId);
	Supplier updateSupplier(int id, Supplier supplierDetails);
	Supplier deleteSupplier(int id);
}