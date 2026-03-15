package com.example.demo.products.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

    @Getter
    @Setter
    @Entity
    @Table(name = "sections")
    public class Section {

        @Id
        private String id;

        private String title;

        private String description;
    }

