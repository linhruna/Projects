package com.example.demo.payment.strategy;

import com.example.demo.payment.dto.request.PaymentRequest;
import com.example.demo.payment.dto.request.VietQrRequest;
import com.example.demo.payment.dto.response.PaymentResponse;
import com.example.demo.payment.dto.response.TokenResponse;
import com.example.demo.payment.dto.response.VietQrResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * VietQR Payment Strategy implementation.
 * Handles payment processing through VietQR API.
 */
@Component
public class VietQrPaymentStrategy implements PaymentStrategy {

    @Value("${vietqr.username}")
    private String username;
    @Value("${vietqr.password}")
    private String password;
    @Value("${vietqr.token-url}")
    private String tokenUrl;
    @Value("${vietqr.qr-url}")
    private String qrUrl;
    @Value("${vietqr.bank-code}")
    private String bankCode;
    @Value("${vietqr.default.acq-id}")
    private String defaultAcqId;
    @Value("${vietqr.default.account-no}")
    private String defaultAccountNo;
    @Value("${vietqr.default.account-name}")
    private String defaultAccountName;

    private final RestTemplate restTemplate;

    public VietQrPaymentStrategy(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String getPaymentMethod() {
        return "VIETQR";
    }

    @Override
    public boolean supports(PaymentRequest request) {
        return request instanceof VietQrRequest;
    }

    @Override
    public PaymentResponse process(PaymentRequest request) {
        if (!(request instanceof VietQrRequest)) {
            return VietQrResponse.builder()
                    .status("FAILED")
                    .message("Invalid request type for VietQR")
                    .build();
        }

        VietQrRequest vietQrRequest = (VietQrRequest) request;

        try {
            // Set default values
            vietQrRequest.setAmount(String.valueOf(vietQrRequest.getAmount()));
            vietQrRequest.setContent(vietQrRequest.getDescription());
            vietQrRequest.setBankCode(bankCode);

            if (vietQrRequest.getAcqId() == null) {
                vietQrRequest.setAcqId(defaultAcqId);
            }
            if (vietQrRequest.getAccountNo() == null) {
                vietQrRequest.setAccountNo(defaultAccountNo);
            }
            if (vietQrRequest.getAccountName() == null) {
                vietQrRequest.setAccountName(defaultAccountName);
            }

            System.out.println("VIETQR REQUEST = " + vietQrRequest);

            String token = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<VietQrRequest> entity = new HttpEntity<>(vietQrRequest, headers);

            ResponseEntity<VietQrResponse> response = restTemplate.postForEntity(qrUrl, entity, VietQrResponse.class);

            VietQrResponse result = response.getBody();

            if (result != null) {
                if (result.getQrCode() != null || result.getQrLink() != null) {
                    result.setStatus("SUCCESS");
                    result.setMessage("Tạo mã VietQR thành công");
                } else {
                    result.setStatus("FAILED");
                    result.setMessage("Không nhận được dữ liệu QR");
                }
            }

            return result;

        } catch (HttpClientErrorException e) {
            return VietQrResponse.builder()
                    .status("FAILED")
                    .message(e.getResponseBodyAsString())
                    .build();
        }
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(username, password);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<TokenResponse> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, entity,
                TokenResponse.class);

        if (response.getBody() == null) {
            throw new RuntimeException("Không lấy được token VietQR");
        }

        return response.getBody().getAccessToken();
    }
}
