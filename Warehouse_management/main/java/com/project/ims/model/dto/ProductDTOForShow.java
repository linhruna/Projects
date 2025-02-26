package com.project.ims.model.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.ims.model.entity.Product;
import lombok.Data;

@Data
public class ProductDTOForShow {
    private int productID;
    private String productName;
    private String category;
    private Double price;
    private String unitCal;
    private Integer quantity;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private  Date lastUpdate;


    public Product constructFromDTO() {
        Product product = new Product(productName, category, price, unitCal, quantity);
        product.setProductID(this.productID);
        return product;
    }
    public static ProductDTOForShow fromEntity(Product product) {
        ProductDTOForShow dto = new ProductDTOForShow();
        dto.setProductID(product.getProductID());
        dto.setProductName(product.getProductName());
        dto.setCategory(product.getCategory());
        dto.setPrice(product.getPrice());
        dto.setUnitCal(product.getUnitCal());
        dto.setQuantity(product.getQuantity());
        dto.setLastUpdate(product.getLastUpdate());
        return dto;

}
}


