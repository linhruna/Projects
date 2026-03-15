package com.example.demo.products.repository;

import com.example.demo.products.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, String> {}