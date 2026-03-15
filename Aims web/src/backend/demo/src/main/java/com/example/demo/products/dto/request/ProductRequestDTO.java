package com.example.demo.products.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProductRequestDTO {

    private String category; // BOOK, CD, DVD, NEWSPAPER

    // ====== THUỘC TÍNH CHUNG =======
    private String title;
    private Long originalValue;
    private Long currentPrice;
    private Integer quantity;
    private String imageURL;
    private String createdBy;
    private Double weight; // Trọng lượng sản phẩm (kg)

    // ====== THUỘC TÍNH CHO BOOK =======
    private String publisher;
    private LocalDate publishDate;
    private String language;
    private String bookType;
    private List<String> authorIds;
    private Integer pages; // Số trang
    private String genre; // Thể loại

    // ====== THUỘC TÍNH CHO CD =======
    private String artist;
    private String recordLabel;
    private String musicType;
    private LocalDate cdReleaseDate;
    private List<TrackRequestDTO> trackDetails;

    // ====== THUỘC TÍNH CHO DVD =======
    private String discType;
    private String director;
    private Integer runTime;
    private String studio;
    private String subtitle;
    private LocalDate dvdReleaseDate;
    private String filmType;

    // ====== THUỘC TÍNH CHO NEWSPAPER =======
    private String newspaperPublisher;
    private String newspaperLanguage;
    private LocalDate newspaperPublishDate;
    private String edition;
    private String sectionId;
}
