package com.project.ims.service;

import com.project.ims.model.dto.ExportDTO;
import com.project.ims.model.dto.FilterExportDTO;
import com.project.ims.model.dto.ProductExportDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ExportService {

    ExportDTO saveExport(ExportDTO exportDTO);

    List<ExportDTO> findAllExports();

    ExportDTO findExportById(int exportID);

    List<ProductExportDTO> getProductsByExport(int exportID);

	ExportDTO getExportDetails(int exportID);

	List<FilterExportDTO> filterExports(LocalDateTime startDate, LocalDateTime endDate, Integer partnerId,
			Integer minProductQuantity, Integer maxProductQuantity);
}
