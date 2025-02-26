package com.project.ims.service;

import com.project.ims.model.dto.PeriodStatisticsDTO;
import com.project.ims.model.dto.ProductStatisticsDTO;

public interface ReportService {
    PeriodStatisticsDTO getStatisticsByPeriod(String type, String period, int year, Integer month);
    ProductStatisticsDTO getStatisticsByProduct(String type, int productId, String period, int year, Integer month);
}