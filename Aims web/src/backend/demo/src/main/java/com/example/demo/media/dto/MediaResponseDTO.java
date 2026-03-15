package com.example.demo.media.dto;

public class MediaResponseDTO {
    private String publicId;
    private String url;
    private String secureUrl;

    public MediaResponseDTO() {}

    public MediaResponseDTO(String publicId, String url, String secureUrl) {
        this.publicId = publicId;
        this.url = url;
        this.secureUrl = secureUrl;
    }

    public String getPublicId() {
        return publicId;
    }

    public String getUrl() {
        return url;
    }

    public String getSecureUrl() {
        return secureUrl;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setSecureUrl(String secureUrl) {
        this.secureUrl = secureUrl;
    }
}
