package com.example.demo.users.enums;

public enum Role {
    ADMIN, // Quản trị viên hệ thống
    MANAGER_PRODUCT, // Nhân viên quản lý sản phẩm
    CUSTOMER // Khách hàng (FIXED: Added to match database values, preventing 500 error on
             // fetch)
}