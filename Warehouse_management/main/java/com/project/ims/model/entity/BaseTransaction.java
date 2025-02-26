package com.project.ims.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@MappedSuperclass
public abstract class BaseTransaction {

    @Column(name = "total_quantity", nullable = false)
    private int totalQuantity;

    @Column(name = "total_money", nullable = false)
    private Double totalMoney;

    @Column(name = "create_date",updatable = false)
    private LocalDateTime createDate;

    @PrePersist
    protected void onCreate() {
        createDate = LocalDateTime.now();
    }
}
