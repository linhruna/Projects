package com.example.demo.payment.service;

import com.example.demo.payment.dto.request.VietQrRequest;
import com.example.demo.payment.dto.response.TokenResponse;
import com.example.demo.payment.dto.response.VietQrResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class VietQrService {

    @Value("${vietqr.username}") private String username;
    @Value("${vietqr.password}") private String password;
    @Value("${vietqr.token-url}") private String tokenUrl;
    @Value("${vietqr.qr-url}") private String qrUrl;

    @Value("${vietqr.bank-code}") private String bankCode;
    @Value("${vietqr.default.acq-id}") private String defaultAcqId;
    @Value("${vietqr.default.account-no}") private String defaultAccountNo;
    @Value("${vietqr.default.account-name}") private String defaultAccountName;

    private final RestTemplate restTemplate;

    public VietQrService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private String getAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(username, password);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<TokenResponse> response =
                restTemplate.exchange(tokenUrl, HttpMethod.POST, entity, TokenResponse.class);

        if (response.getBody() == null) {
            throw new RuntimeException("Không lấy được token VietQR");
        }

        return response.getBody().getAccessToken();
    }

    public VietQrResponse process(VietQrRequest request) {
        try {
            // 1️⃣ map amount (BẮT BUỘC – STRING)
            request.setAmount(String.valueOf(request.getAmount()));

            // 2️⃣ map content
            request.setContent(request.getDescription());

            // 3️⃣ map bankCode
            request.setBankCode(bankCode);

            // 4️⃣ default account & acqId
            if (request.getAcqId() == null) {
                request.setAcqId(defaultAcqId);
            }
            if (request.getAccountNo() == null) {
                request.setAccountNo(defaultAccountNo);
            }
            if (request.getAccountName() == null) {
                request.setAccountName(defaultAccountName);
            }

            // 🔍 debug
            System.out.println("VIETQR REQUEST = " + request);

            // 5️⃣ call VietQR
            String token = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<VietQrRequest> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<VietQrResponse> response =
                    restTemplate.postForEntity(qrUrl, entity, VietQrResponse.class);

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
}
