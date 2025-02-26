package com.project.ims.controller;

import com.project.ims.model.dto.PartnerDTO;
import com.project.ims.model.dto.PartnerDTOForCreate;
import com.project.ims.model.dto.PartnerDTOForShow;
import com.project.ims.model.entity.Partner;
import com.project.ims.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/partners")
public class PartnerController {

    @Autowired
    private PartnerService partnerService;

    @GetMapping("/get-all")
    public List<PartnerDTOForShow> getAllPartners() {
        return partnerService.findAllDTO();
    }

    @GetMapping("/search")
    public List<PartnerDTOForShow> searchPartnersByName(@RequestParam String name) {
        return partnerService.findByNameContainingDTO(name);
    }

    @GetMapping("/search/{partnerId}")
    public Optional<Partner> searchPartnerById(@PathVariable int partnerId) {
        return partnerService.findById(partnerId);
    }

    // Phương thức để thêm đối tác
    @PostMapping
    public ResponseEntity<Map<String, Object>> addPartner(@RequestBody PartnerDTOForCreate partnerDTO) {
        Map<String, Object> response = new HashMap<>();

        // Chuyển đổi PartnerDTO thành đối tượng Partner
        Partner newPartner = new Partner();
        newPartner.setName(partnerDTO.getName());
        newPartner.setContactNumber(partnerDTO.getContactNumber());
        newPartner.setAddress(partnerDTO.getAddress());

        // Gọi Service để lưu đối tác mới vào cơ sở dữ liệu
        Partner savedPartner = partnerService.addPartner(newPartner); 

        if (savedPartner != null) {
            response.put("success", true);
            response.put("message", "Đối tác đã được thêm thành công");
            response.put("partner", savedPartner); // Thêm thông tin đối tác đã lưu vào response
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Lỗi khi thêm đối tác");
            return ResponseEntity.status(400).body(response);
        }
    }


    @GetMapping()
    public List<PartnerDTO> getPartners() {
        return partnerService.findAllSimpleDTO();
    }

    @DeleteMapping("/{partnerId}")
    public ResponseEntity<?> deletePartner(@PathVariable int partnerId) {
        try {
            partnerService.deletePartner(partnerId);
            return ResponseEntity.ok(Map.of("message", "Đối tác đã được xóa thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Partner> updatePartner(@PathVariable int id, @RequestBody Partner partnerDetails) {
        Partner updatedPartner = partnerService.updatePartner(id, partnerDetails);
        return ResponseEntity.ok(updatedPartner);
    }
}
