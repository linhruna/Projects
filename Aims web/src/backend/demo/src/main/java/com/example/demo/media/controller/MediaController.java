package com.example.demo.media.controller;

import com.example.demo.media.dto.MediaResponseDTO;
import com.example.demo.media.dto.SignatureResponseDTO;
import com.example.demo.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MediaResponseDTO create(@RequestParam("file") MultipartFile file) {
        return mediaService.create(file);
    }

    @GetMapping("/{publicId}")
    public MediaResponseDTO get(@PathVariable String publicId) {
        return mediaService.get(publicId);
    }

    @GetMapping("/signature")
    public SignatureResponseDTO signature(
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String publicId
    ) {
        return mediaService.generateUploadSignature(folder, publicId);
    }
}