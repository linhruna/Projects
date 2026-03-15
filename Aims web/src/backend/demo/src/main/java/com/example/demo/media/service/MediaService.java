package com.example.demo.media.service;

import com.example.demo.media.config.CloudinaryConfig;
import com.example.demo.media.dto.MediaResponseDTO;
import com.example.demo.media.dto.SignatureResponseDTO;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class MediaService {

    private final CloudinaryConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    public MediaService(CloudinaryConfig config) {
        this.config = config;
    }

    public MediaResponseDTO create(MultipartFile file) {
        try {
            String uploadUrl = String.format("https://api.cloudinary.com/v1_1/%s/auto/upload", config.getCloudName());
            String folder = "TKXDPM";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            // wrap file bytes so RestTemplate can send multipart
            ByteArrayResource contents = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", contents);
            body.add("folder", folder);

            long timestamp = System.currentTimeMillis() / 1000L;
            body.add("timestamp", String.valueOf(timestamp));
            body.add("api_key", config.getApiKey());

            // signature of required params
            Map<String, String> paramsToSign = new HashMap<>();
            paramsToSign.put("timestamp", String.valueOf(timestamp));
            paramsToSign.put("folder", folder);
            String signature = createSignature(paramsToSign);
            body.add("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(uploadUrl, requestEntity, Map.class);

            Map respBody = response.getBody();
            if (respBody == null) throw new RuntimeException("Empty response from Cloudinary");

            String publicId = (String) respBody.get("public_id");
            String url = (String) respBody.get("url");
            String secureUrl = (String) respBody.get("secure_url");

            return new MediaResponseDTO(publicId, url, secureUrl);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload to Cloudinary: " + e.getMessage(), e);
        }
    }

    public MediaResponseDTO get(String publicId) {
        // simple publicly accessible URL (no admin API call)
        String url = String.format("https://res.cloudinary.com/%s/image/upload/%s", config.getCloudName(), publicId);
        return new MediaResponseDTO(publicId, url, url.replace("http://", "https://"));
    }

    public SignatureResponseDTO generateUploadSignature(String folder, String publicId) {
        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, String> params = new HashMap<>();
        params.put("timestamp", String.valueOf(timestamp));
        if (folder != null && !folder.isBlank()) params.put("folder", folder);
        if (publicId != null && !publicId.isBlank()) params.put("public_id", publicId);

        String signature = createSignature(params);
        String uploadUrl = String.format("https://api.cloudinary.com/v1_1/%s/auto/upload", config.getCloudName());

        return new SignatureResponseDTO(config.getApiKey(), config.getCloudName(), timestamp, signature, uploadUrl);
    }

    private String createSignature(Map<String, String> params) {
        // build param string sorted by key: key1=val1&key2=val2...
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder toSign = new StringBuilder();
        boolean first = true;
        for (String k : keys) {
            String v = params.get(k);
            if (v == null || v.isEmpty()) continue;
            if (!first) toSign.append("&");
            toSign.append(k).append("=").append(v);
            first = false;
        }
        toSign.append(config.getApiSecret());

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(toSign.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create signature", e);
        }
    }
}