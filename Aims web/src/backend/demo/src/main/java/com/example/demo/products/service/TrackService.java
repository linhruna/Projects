package com.example.demo.products.service;

import com.example.demo.products.dto.request.TrackRequestDTO;
import com.example.demo.products.dto.response.TrackResponseDTO;

import java.util.List;

public interface TrackService {
    // Phương thức tạo Track riêng lẻ (yêu cầu ID CD cha)
    TrackResponseDTO create(TrackRequestDTO dto);
    TrackResponseDTO get(String id);
    TrackResponseDTO update(String id, TrackRequestDTO dto);
    void delete(String id);
    List<TrackResponseDTO> listByCdId(String cdId); // Ví dụ phương thức lấy Track theo CD
}