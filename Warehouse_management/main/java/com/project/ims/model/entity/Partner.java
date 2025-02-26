package com.project.ims.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "partner")
public class Partner extends Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int partnerID;
    @JsonIgnore
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Export> exports;
}
