package com.project.ims.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "export")
public class Export extends BaseTransaction {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int exportID;
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "partnerID", nullable = false)
    private Partner partner;

    @OneToMany(mappedBy = "exportEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductExport> productExports;
}
