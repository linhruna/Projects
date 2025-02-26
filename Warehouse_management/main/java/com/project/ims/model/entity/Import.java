package com.project.ims.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "import")
public class Import extends BaseTransaction {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private int importID;
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "supplierID", nullable = false)
    private Supplier supplier;
    
    @OneToMany(mappedBy = "importEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImport> productImports;
}
