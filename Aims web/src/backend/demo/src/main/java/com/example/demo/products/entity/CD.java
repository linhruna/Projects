package com.example.demo.products.entity;

import jakarta.persistence.*;
        import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "cd")
@PrimaryKeyJoinColumn(name = "id")
public class CD extends Product {

    private String artist;
    private String recordLabel;
    private String musicType;
    private LocalDate releaseDate;

    // One CD → Many Tracks
    @OneToMany(mappedBy = "cd", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Track> tracks;
}


