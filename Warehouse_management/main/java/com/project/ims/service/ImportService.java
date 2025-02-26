package com.project.ims.service;

import java.time.LocalDateTime;
import java.util.List;

import com.project.ims.model.dto.FilterImportDTO;
import com.project.ims.model.dto.ImportDTO;

public interface ImportService {
    ImportDTO saveImport(ImportDTO importDTO);

	ImportDTO getImportDetails(int importID);

	

	List<FilterImportDTO> filterImports(LocalDateTime startDate, LocalDateTime endDate, Integer supplierId,
			Integer minProductQuantity, Integer maxProductQuantity);
}