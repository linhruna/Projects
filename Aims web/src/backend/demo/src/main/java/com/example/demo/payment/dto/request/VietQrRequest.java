package com.example.demo.payment.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VietQrRequest extends PaymentRequest {

    // ===== VietQR REQUIRED =====
    private String bankCode;     // VD: MB
    private String accountNo;
    private String accountName;
    private String amount;       // STRING
    private String content;      // KHÔNG PHẢI addInfo
    private String acqId;        // Bank acquisition ID (e.g. 970422 for MB)

    // ===== optional =====
    private String template = "compact";
}
