package com.example.demo.media.dto;


public class SignatureResponseDTO {
    private String apiKey;
    private String cloudName;
    private long timestamp;
    private String signature;
    private String uploadUrl;

    public SignatureResponseDTO() {}

    public SignatureResponseDTO(String apiKey, String cloudName, long timestamp, String signature, String uploadUrl) {
        this.apiKey = apiKey;
        this.cloudName = cloudName;
        this.timestamp = timestamp;
        this.signature = signature;
        this.uploadUrl = uploadUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getCloudName() {
        return cloudName;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getSignature() {
        return signature;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }
}
