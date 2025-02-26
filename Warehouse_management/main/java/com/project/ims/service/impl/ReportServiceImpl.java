package com.project.ims.service.impl;

import com.project.ims.service.ReportService;
import com.project.ims.model.dto.PeriodStatisticsDTO;
import com.project.ims.model.dto.ProductStatisticsDTO;
import com.project.ims.model.dto.PeriodDataDTO;
import com.project.ims.model.dto.ProductPeriodDataDTO;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public PeriodStatisticsDTO getStatisticsByPeriod(String type, String period, int year, Integer month) {
        String sql = buildPeriodQuery(type, period);
        List<Object[]> results = executeQuery(sql, type, period, year, month);
        
        PeriodStatisticsDTO dto = new PeriodStatisticsDTO();
        dto.setType(type);
        dto.setPeriod(period);
        dto.setYear(year);
        dto.setMonth(month);
        dto.setData(mapPeriodData(results, period));
        
        return dto;
    }

    @Override
    public ProductStatisticsDTO getStatisticsByProduct(String type, int productId, String period, int year, Integer month) {
        String sql = buildProductQuery(type, period);
        List<Object[]> results = executeProductQuery(sql, type, productId, period, year, month);
        
        ProductStatisticsDTO dto = new ProductStatisticsDTO();
        dto.setType(type);
        dto.setProductId(productId);
        dto.setPeriod(period);
        dto.setYear(year);
        dto.setMonth(month);
        dto.setData(mapProductData(results, period));
        
        return dto;
    }

    private String buildPeriodQuery(String type, String period) {
        String tableName = type.equals("import") ? "import" : "export";

        switch (period) {
            case "day":
                return "SELECT EXTRACT(DAY FROM \"create_date\") as period_num, COUNT(*) as total " +
                       "FROM \"" + tableName + "\" " +
                       "WHERE EXTRACT(YEAR FROM \"create_date\") = ?1 " +
                       "AND EXTRACT(MONTH FROM \"create_date\") = ?2 " +  // Thêm điều kiện tháng
                       "GROUP BY EXTRACT(DAY FROM \"create_date\") " +
                       "ORDER BY period_num";
            case "week":
                return "SELECT EXTRACT(WEEK FROM \"create_date\") as period_num, COUNT(*) as total " +
                       "FROM \"" + tableName + "\" " +
                       "WHERE EXTRACT(YEAR FROM \"create_date\") = ?1 " +
                       "AND EXTRACT(MONTH FROM \"create_date\") = ?2 " +
                       "GROUP BY EXTRACT(WEEK FROM \"create_date\") " +
                       "ORDER BY period_num";
            case "month":
                return "SELECT EXTRACT(MONTH FROM \"create_date\") as period_num, COUNT(*) as total " +
                       "FROM \"" + tableName + "\" " +
                       "WHERE EXTRACT(YEAR FROM \"create_date\") = ?1 " +
                       "GROUP BY EXTRACT(MONTH FROM \"create_date\") " +
                       "ORDER BY period_num";
            case "year":
                return "SELECT EXTRACT(YEAR FROM \"create_date\") as period_num, COUNT(*) as total " +
                       "FROM \"" + tableName + "\" " +
                       "GROUP BY EXTRACT(YEAR FROM \"create_date\") " +
                       "ORDER BY period_num";
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }
    }


    private String buildProductQuery(String type, String period) {
        String tableName = type.equals("import") ? "product_import" : "product_export";
        String joinTable = type.equals("import") ? "import" : "export";
        String joinColumn = type.equals("import") ? "importid" : "exportid";
        
        switch (period) {
            case "day":
                // Query for daily statistics within a specific month
                return "SELECT EXTRACT(DAY FROM i.\"create_date\") AS period_num, " +
                       "SUM(id.\"quantity\") AS quantity " +  // Using SUM to calculate the total quantity
                       "FROM \"" + tableName + "\" id " +
                       "JOIN \"" + joinTable + "\" i ON id.\"" + joinColumn + "\" = i.\"" + joinColumn + "\" " +
                       "WHERE id.\"productid\" = ?1 " +  // Product ID filter
                       "AND EXTRACT(YEAR FROM i.\"create_date\") = ?2 " +  // Year filter
                       "AND EXTRACT(MONTH FROM i.\"create_date\") = ?3 " +  // Month filter
                       "GROUP BY EXTRACT(DAY FROM i.\"create_date\") " +  // Group by each day in the month
                       "ORDER BY period_num";  // Order by day of the month
            case "month":
                // Query for monthly statistics (sum of quantities)
                return "SELECT EXTRACT(MONTH FROM i.\"create_date\") AS period_num, " +
                       "SUM(id.quantity) AS quantity " +
                       "FROM \"" + tableName + "\" id " +
                       "JOIN \"" + joinTable + "\" i ON id.\"" + joinColumn + "\" = i.\"" + joinColumn + "\" " +
                       "WHERE id.\"productid\" = ?1 " +  // Product ID filter
                       "AND EXTRACT(YEAR FROM i.\"create_date\") = ?2 " +  // Year filter
                       "GROUP BY EXTRACT(MONTH FROM i.\"create_date\") " +  // Group by month
                       "ORDER BY period_num";  // Order by month
            default:
                throw new IllegalArgumentException("Invalid period: " + period);  // Handle invalid period
        }
    }







    private List<Object[]> executeQuery(String sql, String type, String period, int year, Integer month) {
        var query = entityManager.createNativeQuery(sql);

        if ("day".equals(period) || "week".equals(period)) {
            query.setParameter(1, year);
            query.setParameter(2, month); // Cần truyền tháng vào truy vấn
        } else if ("month".equals(period)) {
            query.setParameter(1, year);
        }

        return query.getResultList();
    }


    private List<Object[]> executeProductQuery(String sql, String type, int productId, String period, int year, Integer month) {
        var query = entityManager.createNativeQuery(sql)
                .setParameter(1, productId)
                .setParameter(2, year);
        
        // Set month parameter for 'day' and 'week' periods
        if ("day".equals(period) || "week".equals(period)) {
            if (month == null) {
                throw new IllegalArgumentException("Month must be provided for 'day' or 'week' period.");
            }
            query.setParameter(3, month); // Set month for both 'day' and 'week'
        }
        
        return query.getResultList();
    }


    private List<PeriodDataDTO> mapPeriodData(List<Object[]> results, String period) {
        List<PeriodDataDTO> data = new ArrayList<>();

        for (Object[] result : results) {
            PeriodDataDTO dto = new PeriodDataDTO();
            int periodNum = ((Number) result[0]).intValue();
            int total = ((Number) result[1]).intValue();

            // Chỉ set đúng trường cần thiết
            if ("day".equals(period)) {
                dto.setDay(periodNum);
            } else if ("week".equals(period)) {
                dto.setWeek(periodNum);
            } else if ("month".equals(period)) {
                dto.setMonth(periodNum);
            } else if ("year".equals(period)) {
                dto.setYear(periodNum);
            }

            dto.setTotal(total);
            data.add(dto);
        }

        return data;
    }


    private List<ProductPeriodDataDTO> mapProductData(List<Object[]> results, String period) {
        List<ProductPeriodDataDTO> data = new ArrayList<>();
        
        for (Object[] result : results) {
            ProductPeriodDataDTO dto = new ProductPeriodDataDTO();
            int periodNum = ((Number) result[0]).intValue();  // Extract the period number (day, week, or month)
            int quantity = ((Number) result[1]).intValue();  // Extract the quantity

            // Handle the period-based assignment
            if ("day".equals(period)) {
                dto.setDay(periodNum);  // Only set the day for "day" period
            } else if ("week".equals(period)) {
                dto.setWeek(periodNum);  // Set the week for "week" period
            } else if ("month".equals(period)) {
                dto.setMonth(periodNum);  // Set the month for "month" period
            }
            
            dto.setQuantity(quantity);  // Always set the quantity
            data.add(dto);
        }
        
        return data;
    }



}