package com.example.demo.products.service.impl;

import com.example.demo.products.converter.TrackConverter; // Import Converter
import com.example.demo.products.dto.request.TrackRequestDTO;
import com.example.demo.products.dto.response.TrackResponseDTO; // Import DTO Response
import com.example.demo.products.entity.CD;
import com.example.demo.products.entity.Product;
import com.example.demo.products.entity.Track;
import com.example.demo.products.repository.ProductRepository;
import com.example.demo.products.repository.TrackRepository;
import com.example.demo.products.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors; // Cần thiết cho List

@Service
@Transactional
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final ProductRepository productRepository;
    private final TrackConverter trackConverter; // Inject Converter

    // Lưu ý: Các phương thức trong TrackService phải được cập nhật để trả về TrackResponseDTO

    @Override
    public TrackResponseDTO create(TrackRequestDTO dto) {
        Product product = productRepository.findById(dto.getCdId())
                .orElseThrow(() -> new RuntimeException("CD with ID " + dto.getCdId() + " not found"));

        if (!(product instanceof CD cd)) {
            throw new RuntimeException("Product with ID " + dto.getCdId() + " is not a CD. Cannot add track.");
        }

        // 3. Tạo entity Track mới
        Track track = new Track();
        track.setId(UUID.randomUUID().toString());
        track.setTitle(dto.getTitle());
        track.setLength(dto.getLength());

        // 4. Thiết lập mối quan hệ (Many-to-One)
        track.setCd(cd);

        // 5. Đồng bộ hóa quan hệ hai chiều (One-to-Many) trong bộ nhớ
        if (cd.getTracks() == null) {
            cd.setTracks(new ArrayList<>());
        }
        cd.getTracks().add(track);

        // 6. Lưu Entity
        track = trackRepository.save(track);

        // 7. Chuyển đổi Entity đã lưu sang DTO
        return trackConverter.toDTO(track);
    }

    @Override
    public TrackResponseDTO get(String id) {
        // 1. Tìm Entity
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found: " + id));

        // 2. Chuyển đổi Entity sang DTO
        return trackConverter.toDTO(track);
    }

    @Override
    public TrackResponseDTO update(String id, TrackRequestDTO dto) {
        // 1. Tìm Entity
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found: " + id));

        // 2. Cập nhật Entity
        track.setTitle(dto.getTitle());
        track.setLength(dto.getLength());

        // 3. Lưu Entity đã cập nhật
        track = trackRepository.save(track);

        // 4. Chuyển đổi Entity đã lưu sang DTO
        return trackConverter.toDTO(track);
    }

    @Override
    public void delete(String id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found: " + id));

        CD cd = track.getCd();
        if (cd != null && cd.getTracks() != null) {
            cd.getTracks().remove(track);
        }

        trackRepository.delete(track);
    }

    @Override
    public List<TrackResponseDTO> listByCdId(String cdId) {
        // Cần bổ sung phương thức findByCdId(String cdId) vào TrackRepository
        List<Track> tracks = trackRepository.findByCdId(cdId);

        // Chuyển đổi List<Track> sang List<TrackResponseDTO>
        return tracks.stream()
                .map(trackConverter::toDTO)
                .collect(Collectors.toList());
    }
}