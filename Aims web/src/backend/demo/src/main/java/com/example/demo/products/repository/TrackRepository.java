package com.example.demo.products.repository;

import com.example.demo.products.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackRepository extends JpaRepository<Track, String> {
    List<Track> findByCdId(String cdId);
}