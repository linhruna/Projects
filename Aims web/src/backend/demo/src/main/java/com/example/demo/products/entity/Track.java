package com.example.demo.products.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

    @Getter
    @Setter
    @Entity
    @Table(name = "track")
    public class Track {

        @Id
        private String id;

        private String title;
        private String length;

        @ManyToOne
        @JoinColumn(name = "cd_id")
        private CD cd;
    }


