package com.project.ims.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.text.NumberFormat;
import java.util.Locale;

@Data
@AllArgsConstructor
public class StatisticsDTO {
    private String totalProducts;
    private String totalSuppliers;
    private String totalImports;
    private String totalExports;

    public static String formatNumber(long number) {
        return NumberFormat.getNumberInstance(Locale.US).format(number);
    }

    public static StatisticsDTO fromNumbers(long products, long suppliers, long imports, long exports) {
        return new StatisticsDTO(
                formatNumber(products),
                formatNumber(suppliers),
                formatNumber(imports),
                formatNumber(exports)
        );
    }
}
