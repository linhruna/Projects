package com.example.demo.orders.repository;

import com.example.demo.orders.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByStatusOrderByCreateAtDesc(String status);

    Page<Invoice> findByStatusOrderByCreateAtDesc(String status, Pageable pageable);

    List<Invoice> findByDeliveryInfoEmailOrderByCreateAtDesc(String email);

    java.util.Optional<Invoice> findByOrderAccessToken(String orderAccessToken);

    // Find processed orders (approved, rejected, cancelled) - ordered by most
    // recent action
    Page<Invoice> findByStatusInOrderByCreateAtDesc(List<String> statuses, Pageable pageable);
}