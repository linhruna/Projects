package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

    @Getter
    @Setter
    @Entity
    @Table(name = "dvds")
    @DiscriminatorValue("DVD")
    public class DVD extends Product {

        private String discType;
        private String director;
        private Integer runTime;
        private String studio;
        private String subtitle;

        private LocalDate releaseDate;

        private String filmType;

    }

