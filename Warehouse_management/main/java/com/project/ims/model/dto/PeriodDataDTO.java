package com.project.ims.model.dto;

import lombok.Data;

@Data
public class PeriodDataDTO {
	  private Integer day;    // Thêm ngày (dành cho period = "day")
	    private Integer week;   // Số tuần (dành cho period = "week")
	    private Integer month;  // Số tháng (dành cho period = "month")
	    private Integer year;   // Số năm (dành cho period = "year")
	    private int total;      // Tổng số lượng giao dịch
}
