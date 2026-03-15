package com.example.demo.payment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaypalResponse extends PaymentResponse {
    private String id;

    @JsonProperty("payment_source")
    private Map<String, Object> paymentSource;

    private List<PaypalLink> links;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaypalLink {
        private String href;
        private String rel;
        private String method;
    }
}