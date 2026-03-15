package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

    @Getter
    @Setter
    @Entity
    @Table(name = "newspapers")
    @DiscriminatorValue("NEWSPAPER")
    public class Newspaper extends Product {

        private String publisher;
        private String language;

        private LocalDate publishDate;

        private String edition;

        @ManyToOne
        @JoinColumn(name = "section_id")
        private Section section;
    }
