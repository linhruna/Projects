package com.project.ims.service.impl;

import com.project.ims.model.dto.ExportDTO;
import com.project.ims.model.dto.FilterExportDTO;
import com.project.ims.model.dto.ProductExportDTO;
import com.project.ims.model.entity.Export;
import com.project.ims.model.entity.Partner;
import com.project.ims.model.entity.Product;
import com.project.ims.model.entity.ProductExport;
import com.project.ims.repository.ExportRepository;
import com.project.ims.repository.PartnerRepository;
import com.project.ims.repository.ProductExportRepository;
import com.project.ims.repository.ProductRepository;
import com.project.ims.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExportServiceImpl implements ExportService {

    @Autowired
    private ExportRepository exportRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductExportRepository productExportRepository;

    @Override
    @Transactional
    public ExportDTO saveExport(ExportDTO exportDTO) {
        // Tạo đối tượng Export và gán dữ liệu
        Export exportEntity = new Export();
        exportEntity.setTotalQuantity(exportDTO.getTotalQuantity());
        exportEntity.setTotalMoney(exportDTO.getTotalMoney());

        // Tìm và thiết lập Partner
        Partner partner = partnerRepository.findById(Integer.parseInt(exportDTO.getPartnerID()))
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        exportEntity.setPartner(partner);

        // Lưu exportEntity để lấy ID sau khi persist
        exportEntity = exportRepository.save(exportEntity);

        // Lưu danh sách ProductExport
        List<ProductExport> productExports = new ArrayList<>();
        for (int i = 0; i < exportDTO.getProductIDs().size(); i++) {
            String productId = exportDTO.getProductIDs().get(i);
            int quantity = Integer.parseInt(exportDTO.getQuantities().get(i));

            Product product = productRepository.findById(Integer.parseInt(productId))
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            ProductExport productExport = new ProductExport();
            productExport.setProductEntity(product);
            productExport.setQuantity(quantity);
            productExport.setExportEntity(exportEntity);
            productExport.setTotalMoney(quantity * product.getPrice()); // Tổng tiền cho từng sản phẩm
            productExports.add(productExport);
            // Cập nhật quantity của sản phẩm trong bảng Product (giảm số lượng)
            if (product.getQuantity() >= quantity) {
                product.setQuantity(product.getQuantity() - quantity);
                productRepository.save(product);
            } else {
                throw new RuntimeException("Not enough quantity for product: " + product.getProductID());
            }
        
        }
        productExportRepository.saveAll(productExports);

        // Chuyển đổi lại ExportEntity sang DTO để trả về
        ExportDTO result = new ExportDTO();
        result.setExportID(exportEntity.getExportID());
        result.setQuantities(exportDTO.getQuantities());
        result.setTotalMoney(exportDTO.getTotalMoney());
        result.setTotalQuantity(exportDTO.getTotalQuantity());
        result.setPartnerID(exportDTO.getPartnerID());
        result.setProductIDs(exportDTO.getProductIDs());

        return result;
    }

    @Override
    public List<ExportDTO> findAllExports() {
        return exportRepository.findAll().stream()
                .map(export -> {
                    ExportDTO dto = new ExportDTO();
                    dto.setExportID(export.getExportID());
                    dto.setTotalQuantity(export.getTotalQuantity());
                    dto.setTotalMoney(export.getTotalMoney());
                    dto.setPartnerID(String.valueOf(export.getPartner().getPartnerID()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ExportDTO findExportById(int exportID) {
        Export export = exportRepository.findById(exportID)
                .orElseThrow(() -> new RuntimeException("Export not found"));

        ExportDTO dto = new ExportDTO();
        dto.setExportID(export.getExportID());
        dto.setTotalQuantity(export.getTotalQuantity());
        dto.setTotalMoney(export.getTotalMoney());
        dto.setPartnerID(String.valueOf(export.getPartner().getPartnerID()));
        return dto;
    }

    @Override
    public List<ProductExportDTO> getProductsByExport(int exportID) {
        Export export = exportRepository.findById(exportID)
                .orElseThrow(() -> new RuntimeException("Export not found"));

        return export.getProductExports().stream()
                .map(productExport -> {
                    ProductExportDTO dto = new ProductExportDTO();
                    dto.setProductID(productExport.getProductEntity().getProductID());
                    dto.setProductName(productExport.getProductEntity().getProductName());
                    dto.setQuantity(productExport.getQuantity());
                    dto.setTotalMoney(productExport.getTotalMoney());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    @Override
    public ExportDTO getExportDetails(int exportID) {
        Export exportEntity = exportRepository.findById(exportID)
            .orElseThrow(() -> new RuntimeException("Export not found"));

        List<ProductExportDTO> productExports = exportEntity.getProductExports().stream()
            .map(productExport -> {
                ProductExportDTO dto = new ProductExportDTO();
                dto.setProductID(productExport.getProductEntity().getProductID());
                dto.setProductName(productExport.getProductEntity().getProductName());
                dto.setQuantity(productExport.getQuantity());
                dto.setTotalMoney(productExport.getTotalMoney());
                dto.setPrice(productExport.getProductEntity().getPrice());
                
                return dto;
            }).collect(Collectors.toList());

        ExportDTO result = new ExportDTO();
        result.setExportID(exportEntity.getExportID());
        result.setTotalQuantity(exportEntity.getTotalQuantity());
        result.setTotalMoney(exportEntity.getTotalMoney());
        result.setPartnerID(String.valueOf(exportEntity.getPartner().getPartnerID()));
        result.setProductExports(productExports); // Gán danh sách sản phẩm vào DTO
        result.setCreateDate(exportEntity.getCreateDate());
        result.setPartner(exportEntity.getPartner());
        return result;
    }
    @Override
    public List<FilterExportDTO> filterExports(LocalDateTime startDate, LocalDateTime endDate, Integer partnerId, Integer minProductQuantity, Integer maxProductQuantity) {
        return exportRepository.findFilteredExports(startDate, endDate, partnerId, minProductQuantity, maxProductQuantity)
            .stream()
            .map(exportEntity -> {
                FilterExportDTO dto = new FilterExportDTO();
                dto.setExportID(exportEntity.getExportID());
                dto.setPartnerName(exportEntity.getPartner().getName());
                dto.setTotalQuantity(exportEntity.getTotalQuantity());
                dto.setTotalMoney(exportEntity.getTotalMoney());
                dto.setCreateDate(exportEntity.getCreateDate());
             // Trích xuất danh sách productIds từ ProductExport
                List<String> productIds = exportEntity.getProductExports().stream()
                    .map(productExport -> String.valueOf(productExport.getProductEntity().getProductID())) // Lấy productId từ ProductEntity
                    .collect(Collectors.toList());
                
                dto.setProductIDs(productIds);
                return dto;
            })
            .collect(Collectors.toList());
    }

}
