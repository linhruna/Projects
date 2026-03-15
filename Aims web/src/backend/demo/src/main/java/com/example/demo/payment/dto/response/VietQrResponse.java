package com.example.demo.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VietQrResponse extends PaymentResponse {
    private String bankCode;
    private String bankName;
    private String bankAccount;
    private String userBankName;
    private String amount;
    private String content;
    private String qrCode;
    private String imgId;
    private Integer existing;
    private String transactionId;
    private String transactionRefId;
    private String qrLink;
    private String terminalCode;
    private String subTerminalCode;
    private String serviceCode;
    private String orderId;
    private List<Object> additionalData;
    private String vaAccount;
}