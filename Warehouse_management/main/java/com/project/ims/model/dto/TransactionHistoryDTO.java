package com.project.ims.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionHistoryDTO {

    @JsonProperty("type")
    private String type;

    @JsonProperty("transaction_id")
    private int transactionId;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("product_id")
    private int productId;

    @JsonProperty("quantity")
    private int quantity;
}
