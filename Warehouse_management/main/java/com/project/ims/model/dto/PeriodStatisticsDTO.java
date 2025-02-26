package com.project.ims.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class PeriodStatisticsDTO {
    private String type;
    private String period;
    private int year;
    private Integer month;
    private List<PeriodDataDTO> data;
}
