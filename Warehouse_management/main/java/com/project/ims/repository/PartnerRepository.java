package com.project.ims.repository;

import com.project.ims.model.dto.PartnerDTOForShow;
import com.project.ims.model.entity.Partner;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Integer> {

	List<Partner> findByNameContaining(String name);
}
