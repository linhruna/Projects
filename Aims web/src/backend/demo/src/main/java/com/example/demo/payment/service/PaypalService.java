package com.example.demo.payment.service;

import com.example.demo.payment.dto.request.PaypalRequest;
import com.example.demo.payment.dto.response.PaypalResponse;
import com.example.demo.payment.dto.response.TokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class PaypalService {

    @Value("${paypal.client-id}") private String clientId;
    @Value("${paypal.client-secret}") private String clientSecret;
    @Value("${paypal.token-url}") private String tokenUrl;
    @Value("${paypal.order-url}") private String orderUrl;
    @Value("${paypal.return-url}") private String returnUrl;
    @Value("${paypal.cancel-url}") private String cancelUrl;

    private final RestTemplate restTemplate;

    public PaypalService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<TokenResponse> response =
                restTemplate.postForEntity(tokenUrl, entity, TokenResponse.class);

        if (response.getBody() == null) {
            throw new RuntimeException("Không lấy được token PayPal");
        }

        return response.getBody().getAccessToken();
    }

    public PaypalResponse process(PaypalRequest request) {
        try {
            String token = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // amount USD, format chuẩn PayPal
            BigDecimal value = BigDecimal.valueOf(request.getAmount())
                    .setScale(2, RoundingMode.HALF_UP);

            Map<String, Object> orderRequest = Map.of(
                    "intent", "CAPTURE",
                    "payment_source", Map.of(
                            "paypal", Map.of(
                                    "experience_context", Map.of(
                                            "payment_method_preference", "IMMEDIATE_PAYMENT_REQUIRED",
                                            "landing_page", "LOGIN",
                                            "user_action", "PAY_NOW",
                                            "return_url", returnUrl,
                                            "cancel_url", cancelUrl
                                    )
                            )
                    ),
                    "purchase_units", List.of(Map.of(
                            "amount", Map.of(
                                    "currency_code", request.getCurrency(),
                                    "value", value.toString()
                            ),
                            "description", request.getDescription() == null ? "" : request.getDescription()
                    ))
            );

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(orderRequest, headers);

            ResponseEntity<PaypalResponse> response =
                    restTemplate.postForEntity(orderUrl, entity, PaypalResponse.class);

            PaypalResponse result = response.getBody();
            if (result != null) {
                result.setStatus("SUCCESS");
                result.setMessage("PayPal order created successfully");
            }
            return result;

        } catch (HttpClientErrorException e) {
            return PaypalResponse.builder()
                    .status("FAILED")
                    .message(e.getResponseBodyAsString())
                    .build();
        }
    }
}
