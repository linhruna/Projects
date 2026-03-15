# AIMS: An Internet Media Store
## Screen Standardization & Design Document

**Version:** 1.0  
**Date:** November 21, 2025  
**Prepared by:** AIMS Development Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Screen Standardization Requirements](#screen-standardization-requirements)
3. [UI Kit Specifications](#ui-kit-specifications)
4. [Data Formatting Standards](#data-formatting-standards)
5. [Screen Design Summary Table](#screen-design-summary-table)
6. [Wireframe Mockups](#wireframe-mockups)
7. [Component Behavior Guide](#component-behavior-guide)

---

## 1. Introduction

This document provides comprehensive screen standardization guidelines and wireframe mockups for the AIMS (An Internet Media Store) e-commerce web application. The application supports three user roles: Customer, Product Manager, and Admin, each with role-specific access to different screens.

### Application Overview
- **Purpose:** Online store for media products (Books, Newspapers, CDs, DVDs)
- **Target Resolution:** Minimum 1366×768px, responsive for tablet (768px) and mobile (320px+)
- **Technology Stack:** React + Tailwind CSS

---

## 2. Screen Standardization Requirements

### 2.1 Layout Standards

| Element | Specification |
|---------|--------------|
| **Minimum Resolution** | 1366×768px desktop, responsive for tablet/mobile |
| **Screen Title** | Top-center, H1 style (24px) |
| **Menu/Navigation Bar** | Top-right corner, horizontal layout |
| **Header** | Sticky at top, contains logo, navigation, cart icon, user menu |
| **Content Area** | Main body with appropriate padding (24px desktop, 16px mobile) |
| **Action Buttons** | Bottom-right or center-aligned for primary actions |
| **Footer** | Bottom of page, contact info and copyright |

### 2.2 Interaction Standards

| Interaction | Specification |
|------------|--------------|
| **Input Validation** | 1. Check empty → 2. Format validation → 3. Display error message |
| **Focus Navigation** | Logical tab order (top-left to bottom-right) |
| **Modal/Popup Behavior** | Disable main screen interaction, ESC to close, X button top-right |
| **Error Messages** | Clear, concise, actionable (e.g., "Phone number must be 10 digits") |
| **Keyboard Navigation** | Enter to submit, ESC to close/cancel, Tab for navigation |
| **Loading States** | Spinner with disabled buttons during processing |
| **Empty States** | Friendly message with action to populate (e.g., "Cart is empty. Start shopping!") |

### 2.3 Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
|-----------|-------|-------------------|
| Desktop | ≥1024px | Full layout with sidebars, multi-column grids |
| Tablet | 768px - 1023px | 2-column grids, collapsible sidebars |
| Mobile | 320px - 767px | Single column, hamburger menu, stacked forms |

---

## 3. UI Kit Specifications

### 3.1 Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| **H1 (Page Title)** | Roboto | 24px | 700 (Bold) | #333333 |
| **H2 (Section Title)** | Roboto | 20px | 600 (Semi-Bold) | #333333 |
| **H3 (Subsection)** | Roboto | 18px | 600 (Semi-Bold) | #333333 |
| **Body Text** | Roboto | 16px | 400 (Regular) | #333333 |
| **Small Text** | Roboto | 14px | 400 (Regular) | #666666 |
| **Caption** | Roboto | 12px | 400 (Regular) | #999999 |

### 3.2 Color Palette

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| **Primary Blue** | #0078D7 | Primary buttons, links, active states |
| **Primary Hover** | #005A9E | Button hover states |
| **Accent Orange** | #FF5722 | Price tags, urgent actions, badges |
| **Success Green** | #4CAF50 | Success messages, in-stock indicators |
| **Warning Orange** | #FF9800 | Warning messages, low stock |
| **Error Red** | #F44336 | Error messages, delete actions |
| **Background Light** | #F5F5F5 | Page background |
| **Background White** | #FFFFFF | Card backgrounds, input fields |
| **Text Primary** | #333333 | Primary text content |
| **Text Secondary** | #666666 | Secondary text, descriptions |
| **Text Disabled** | #999999 | Disabled text |
| **Border Default** | #CCCCCC | Input borders, dividers |
| **Border Hover** | #0078D7 | Input focus borders |

### 3.3 Button Styles

| Button Type | Background | Text Color | Border | Height | Padding | Border Radius |
|------------|-----------|-----------|--------|--------|---------|--------------|
| **Primary** | #0078D7 | #FFFFFF | None | 40px | 16px 32px | 6px |
| **Primary Hover** | #005A9E | #FFFFFF | None | 40px | 16px 32px | 6px |
| **Secondary** | #F5F5F5 | #333333 | 1px #CCCCCC | 40px | 16px 32px | 6px |
| **Danger** | #F44336 | #FFFFFF | None | 40px | 16px 24px | 6px |
| **Disabled** | #E0E0E0 | #999999 | None | 40px | 16px 32px | 6px |
| **Icon Button** | Transparent | #333333 | None | 40px | 8px | 6px |

### 3.4 Input Fields

| Property | Value |
|----------|-------|
| **Border** | 1px solid #CCCCCC |
| **Border Radius** | 4px |
| **Padding** | 10px 12px |
| **Height** | 40px |
| **Font Size** | 16px |
| **Focus Border** | 2px solid #0078D7 |
| **Error Border** | 2px solid #F44336 |
| **Placeholder Color** | #999999 |

### 3.5 Cards & Containers

| Property | Value |
|----------|-------|
| **Background** | #FFFFFF |
| **Border Radius** | 8px |
| **Padding** | 16px |
| **Box Shadow** | 0 2px 4px rgba(0,0,0,0.1) |
| **Hover Shadow** | 0 4px 8px rgba(0,0,0,0.15) |
| **Hover Transform** | translateY(-2px) |

### 3.6 Icons

| Property | Value |
|----------|-------|
| **Library** | Lucide React (Material Design style) |
| **Default Size** | 24px |
| **Small Size** | 16px |
| **Large Size** | 32px |
| **Color** | Inherit from parent or #333333 |

---

## 4. Data Formatting Standards

### 4.1 Number Formatting

| Data Type | Format | Example |
|-----------|--------|---------|
| **Integer** | Comma separator | 1,000 |
| **Decimal** | Comma separator, 2 decimal places | 1,234.56 |
| **Currency (VND)** | Comma separator + ₫ symbol | 1,500,000₫ |
| **Percentage** | Number + % symbol | 10% |
| **Quantity** | No separator for small numbers | 5 items |

### 4.2 Date & Time Formatting

| Data Type | Format | Example |
|-----------|--------|---------|
| **Date** | DD/MM/YYYY | 21/11/2025 |
| **Date with Time** | DD/MM/YYYY HH:mm | 21/11/2025 14:30 |
| **Time** | HH:mm | 14:30 |
| **Relative Time** | "X minutes/hours/days ago" | 2 hours ago |

### 4.3 Text Formatting

| Data Type | Rule | Example |
|-----------|------|---------|
| **Product Name** | Title Case, max 100 characters | The Great Gatsby |
| **Email** | Lowercase, RFC 5322 standard | user@example.com |
| **Phone Number** | 10 digits, no spaces | 0123456789 |
| **Address** | Proper capitalization | 123 Main Street, Hanoi |
| **ISBN/ISSN** | Hyphenated format | 978-3-16-148410-0 |

### 4.4 Input Validation Rules

| Field Type | Validation Rules |
|-----------|-----------------|
| **Email** | Required, valid email format, max 100 chars |
| **Phone** | Required, exactly 10 digits, numeric only |
| **Price** | Required, positive number, max 999,999,999 |
| **Stock Quantity** | Required, non-negative integer |
| **Name** | Required, 2-100 characters, letters and spaces |
| **Address** | Required, 10-200 characters |
| **Date** | Valid date, not in future (for publication dates) |

---

## 5. Screen Design Summary Table

| Screen Name | Primary Users | Key Components | Main Actions | Data Displayed |
|------------|--------------|----------------|--------------|----------------|
| **Home Page** | All | Header, Search Bar, Filter Panel, Product Grid, Footer | Search, Filter, View Product, Add to Cart | 20 products with image, name, type, price, stock |
| **Product Detail** | All | Header, Product Image, Product Info Panel, Quantity Selector, Related Info | Select Quantity, Add to Cart, Back | Full product details (varies by type), price, stock, description |
| **Cart Page** | All | Header, Cart Items List, Quantity Controls, Order Summary Panel | Update Quantity, Remove Item, Proceed to Checkout | Cart items with image, name, price, quantity, subtotal, VAT, total |
| **Checkout Page** | All | Header, Shipping Form, Payment Method Selector, Order Summary | Fill Form, Select Payment, Confirm Order | Shipping info fields, payment options, order summary with shipping fee |
| **Product Management** | Product Manager | Header, Action Buttons, Product Table, Edit Form, History Panel | Add Product, Edit Product, Deactivate, Delete, View History | Product list with type, price, stock, status; history log |
| **User Management** | Admin | Header, Action Buttons, User Table, Edit Form | Create User, Edit User, Block/Unblock, Reset Password, Delete | User list with name, email, role, status |

---

## 6. Wireframe Mockups

### Legend
```
┌─────────┐   = Container/Box
│  Text   │   = Content area
├─────────┤   = Divider/Border
[Button]      = Clickable button
[Input___]    = Text input field
{Image}       = Placeholder image
(Icon)        = Icon element
▼ Dropdown    = Dropdown menu
[ ] Checkbox  = Checkbox
( ) Radio     = Radio button
═══════════   = Header/Footer section
───────────   = Horizontal divider
```

---

### 6.1 Home Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store              [Home] [Cart (2)] [Quản lý] [👤 User] ║
═════════════════════════════════════════════════════════════════════════

                        Chào mừng đến AIMS Store
                  Khám phá bộ sưu tập media phong phú

┌─────────────────────────────────────────────────────────────────────┐
│  (🔍) [Search: Tìm kiếm sản phẩm...________________]  [  X  ]       │
│                                                                       │
│  Loại sản phẩm:  [Tất cả] [Sách] [Báo] [CD] [DVD]                  │
│                                                                       │
│  Khoảng giá:  [Tất cả] [<100k] [100k-200k] [200k-300k] [>300k]     │
│                                                                       │
│  Tìm thấy 20 sản phẩm                                               │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   {Product}    │  │   {Product}    │  │   {Product}    │  │   {Product}    │
│     Image      │  │     Image      │  │     Image      │  │     Image      │
│                │  │                │  │                │  │                │
│  [Book Badge]  │  │  [CD Badge]    │  │  [DVD Badge]   │  │  [Book Badge]  │
│                │  │                │  │                │  │                │
│ The Great      │  │ Thriller -     │  │ The Shawshank  │  │ Harry Potter   │
│ Gatsby         │  │ Michael Jackson│  │ Redemption     │  │ và Hòn đá...   │
│                │  │                │  │                │  │                │
│ 150,000₫       │  │ 280,000₫       │  │ 150,000₫       │  │ 120,000₫       │
│ (chưa VAT)     │  │ (chưa VAT)     │  │ (chưa VAT)     │  │ (chưa VAT)     │
│                │  │                │  │                │  │                │
│ Còn: 15 SP     │  │ Còn: 12 SP     │  │ Còn: 20 SP     │  │ Còn: 30 SP     │
│                │  │                │  │                │  │                │
│ [Chi tiết]     │  │ [Chi tiết]     │  │ [Chi tiết]     │  │ [Chi tiết]     │
│ [Thêm giỏ]     │  │ [Thêm giỏ]     │  │ [Thêm giỏ]     │  │ [Thêm giỏ]     │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   {Product}    │  │   {Product}    │  │   {Product}    │  │   {Product}    │
│     Image      │  │     Image      │  │     Image      │  │     Image      │
│      ...       │  │      ...       │  │      ...       │  │      ...       │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
                    (Grid continues with more products...)

═════════════════════════════════════════════════════════════════════════
║  Về AIMS Store          │  Liên hệ              │  Giờ làm việc       ║
║  AIMS - An Internet     │  📍 Số 1 Đại Cồ Việt  │  T2-T6: 8:00-20:00  ║
║  Media Store            │  ☎ 024 3869 4242      │  T7-CN: 9:00-18:00  ║
║                         │  ✉ contact@aims.vn     │                     ║
║                                                                         ║
║              © 2025 AIMS Store. All rights reserved.                   ║
═════════════════════════════════════════════════════════════════════════

Responsive Mobile View (≤768px):
═════════════════════════════════
║ (☰) AIMS    [🛒2] [👤User]  ║
═════════════════════════════════
  Chào mừng đến AIMS Store
     
┌───────────────────────────────┐
│ [Search____________] [🔍]     │
│ ▼ Loại SP   ▼ Giá            │
└───────────────────────────────┘

┌───────────────────────────────┐
│      {Product Image}          │
│   [Book]  The Great Gatsby    │
│   150,000₫ | Còn: 15           │
│   [Chi tiết] [Thêm vào giỏ]  │
└───────────────────────────────┘
┌───────────────────────────────┐
│      {Product Image}          │
│         ...                   │
└───────────────────────────────┘
```

**Component Behaviors:**
- **Search Bar**: Real-time filtering on input, clear button appears when text entered
- **Filter Buttons**: Active filter highlighted in blue, multiple filters can combine
- **Product Cards**: Hover effect lifts card 2px, shows subtle shadow
- **Add to Cart**: Updates cart count in header, shows toast notification
- **View Details**: Navigates to Product Detail page

---

### 6.2 Product Detail Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store              [Home] [Cart (3)] [Quản lý] [👤 User] ║
═════════════════════════════════════════════════════════════════════════

[← Quay lại]

┌──────────────────────────────────┬──────────────────────────────────────┐
│                                  │                                      │
│                                  │  The Great Gatsby                    │
│                                  │                                      │
│        {Product Image}           │  150,000₫  (chưa VAT)                │
│                                  │  Tình trạng: Còn 15 sản phẩm         │
│          (Large)                 │                                      │
│                                  │  ─────────────────────────────────   │
│                                  │  Mô tả                               │
│                                  │  A classic American novel set in     │
│       500px x 500px              │  the Jazz Age...                     │
│                                  │                                      │
│                                  │  ─────────────────────────────────   │
│                                  │  Chi tiết sản phẩm                   │
│                                  │                                      │
│                                  │  Tác giả:         F. Scott Fitzgerald│
│                                  │  Loại bìa:        Paperback          │
│                                  │  Nhà xuất bản:    Scribner           │
│                                  │  Ngày xuất bản:   10/04/1925         │
│                                  │  Số trang:        180                │
│                                  │  Ngôn ngữ:        English            │
│                                  │  Thể loại:        Classic Fiction    │
│                                  │                                      │
│                                  │  ─────────────────────────────────   │
│                                  │  Số lượng                            │
│                                  │  [ - ]  [ 1 ]  [ + ]                 │
│                                  │  (Max: Đã đạt số lượng tối đa)       │
│                                  │                                      │
│                                  │  [    🛒 Thêm vào giỏ hàng    ]     │
│                                  │  (Full width button, 48px height)    │
└──────────────────────────────────┴──────────────────────────────────────┘

Product Type Variations:

CD Detail Panel:
┌──────────────────────────────────────────┐
│ Nghệ sĩ:         Michael Jackson         │
│ Hãng thu:        Epic Records            │
│ Thể loại:        Pop                     │
│ Ngày phát hành:  30/11/1982              │
│ ──────────────────────────────────────   │
│ Danh sách track:                         │
│ 1. Wanna Be Startin' Somethin'   6:03   │
│ 2. Baby Be Mine                  4:20   │
│ 3. The Girl Is Mine              3:42   │
│ 4. Thriller                      5:57   │
│ ...                                      │
└──────────────────────────────────────────┘

DVD Detail Panel:
┌──────────────────────────────────────────┐
│ Loại đĩa:        Blu-ray                 │
│ Đạo diễn:        Christopher Nolan       │
│ Thời lượng:      152 phút                │
│ Studio:          Warner Bros.            │
│ Ngôn ngữ:        English                 │
│ Phụ đề:          English, Vietnamese,... │
│ Ngày phát hành:  18/07/2008              │
│ Thể loại:        Action                  │
└──────────────────────────────────────────┘

Mobile View (≤768px):
═════════════════════════════════
║ [←] AIMS    [🛒3] [👤]       ║
═════════════════════════════════

┌───────────────────────────────┐
│                               │
│     {Product Image}           │
│                               │
└───────────────────────────────┘

The Great Gatsby
150,000₫ (chưa VAT)
Còn: 15 sản phẩm

─────────────────────────────
Mô tả
A classic American novel...

─────────────────────────────
Chi tiết sản phẩm
Tác giả: F. Scott Fitzgerald
Loại bìa: Paperback
...

─────────────────────────────
Số lượng
[ - ]  [ 1 ]  [ + ]

[  🛒 Thêm vào giỏ hàng  ]
```

**Component Behaviors:**
- **Quantity Selector**: Minus button disabled at 1, Plus disabled at stock limit
- **Add to Cart**: Validates quantity ≤ stock, shows toast on success
- **Back Button**: Returns to previous page (Home or search results)
- **Product Details**: Dynamically rendered based on product type (Book/CD/DVD/Newspaper)

---

### 6.3 Cart Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store              [Home] [Cart (3)] [Quản lý] [👤 User] ║
═════════════════════════════════════════════════════════════════════════

                          Giỏ hàng của bạn

┌────────────────────────────────────────────────┬──────────────────────┐
│  Cart Items (Left Column - 66%)               │  Order Summary       │
│                                                │  (Right Column-33%)  │
│  ┌──────────────────────────────────────────┐ │                      │
│  │ {Img}  The Great Gatsby                  │ │  Tóm tắt đơn hàng    │
│  │ 80x80  ─────────────────                 │ │                      │
│  │        Đơn giá: 150,000₫                 │ │  Tạm tính:           │
│  │        Còn lại: 15 sản phẩm              │ │  450,000₫            │
│  │                                     [🗑]  │ │                      │
│  │        Quantity: [-] [1] [+]             │ │  VAT (10%):          │
│  │        Thành tiền: 150,000₫              │ │  45,000₫             │
│  └──────────────────────────────────────────┘ │                      │
│                                                │  ─────────────────   │
│  ┌──────────────────────────────────────────┐ │  Tổng cộng:          │
│  │ {Img}  Thriller - Michael Jackson        │ │  495,000₫            │
│  │ 80x80  ─────────────────                 │ │  (chưa phí ship)     │
│  │        Đơn giá: 280,000₫                 │ │                      │
│  │        Còn lại: 12 sản phẩm              │ │                      │
│  │                                     [🗑]  │ │                      │
│  │        Quantity: [-] [2] [+]             │ │  [   Đặt hàng   ]    │
│  │        Thành tiền: 560,000₫              │ │  (Primary button)    │
│  │    ⚠ Vượt quá số lượng tồn kho!          │ │                      │
│  └──────────────────────────────────────────┘ │  [Tiếp tục mua sắm]  │
│                                                │  (Secondary button)  │
│  ┌──────────────────────────────────────────┐ │                      │
│  │ {Img}  Harry Potter và Hòn đá Phù thủy   │ │                      │
│  │ 80x80  ─────────────────                 │ │                      │
│  │        Đơn giá: 120,000₫                 │ │                      │
│  │        Còn lại: 30 sản phẩm              │ │                      │
│  │                                     [🗑]  │ │                      │
│  │        Quantity: [-] [1] [+]             │ │                      │
│  │        Thành tiền: 120,000₫              │ │                      │
│  └──────────────────────────────────────────┘ │                      │
└────────────────────────────────────────────────┴──────────────────────┘

Empty Cart State:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                          🛒 (Large icon)                              │
│                                                                       │
│                      Giỏ hàng trống                                   │
│                                                                       │
│              Bạn chưa có sản phẩm nào trong giỏ hàng                  │
│                                                                       │
│                    [  Tiếp tục mua sắm  ]                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Mobile View (≤768px):
═════════════════════════════════
║ AIMS    [🛒3] [👤User]       ║
═════════════════════════════════

     Giỏ hàng của bạn

┌───────────────────────────────┐
│ {Img} The Great Gatsby        │
│       150,000₫                │
│       Còn: 15       [🗑]       │
│       [-] [1] [+]             │
│       = 150,000₫              │
└───────────────────────────────┘

┌───────────────────────────────┐
│ {Img} Thriller - MJ           │
│       ...                     │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Tóm tắt đơn hàng              │
│ Tạm tính:      450,000₫       │
│ VAT (10%):      45,000₫       │
│ ─────────────────────         │
│ Tổng cộng:     495,000₫       │
│                               │
│ [      Đặt hàng        ]      │
│ [   Tiếp tục mua sắm   ]      │
└───────────────────────────────┘
```

**Component Behaviors:**
- **Quantity Controls**: Update cart in real-time, recalculate totals
- **Delete Button**: Removes item with confirmation toast
- **Stock Warning**: Red text appears when quantity > stock
- **Order Summary**: Auto-updates when cart changes, sticky on desktop
- **Checkout Button**: Navigates to Checkout page, disabled if cart has errors

---

### 6.4 Checkout Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store              [Home] [Cart (3)] [Quản lý] [👤 User] ║
═════════════════════════════════════════════════════════════════════════

                              Thanh toán

┌────────────────────────────────────────────────┬──────────────────────┐
│  Checkout Form (Left Column - 66%)            │  Đơn hàng            │
│                                                │  (Right - 33%)       │
│  ┌──────────────────────────────────────────┐ │                      │
│  │  Thông tin giao hàng                     │ │  ┌────────────────┐  │
│  │                                          │ │  │ {Img} Product  │  │
│  │  Họ và tên *                             │ │  │ The Great...   │  │
│  │  [Nguyễn Văn A________________]          │ │  │ 1x150,000₫     │  │
│  │                                          │ │  └────────────────┘  │
│  │  Số điện thoại *                         │ │  ┌────────────────┐  │
│  │  [0123456789__________________]          │ │  │ {Img} Product  │  │
│  │  ℹ 10 chữ số                             │ │  │ Thriller...    │  │
│  │                                          │ │  │ 2x280,000₫     │  │
│  │  Địa chỉ *                               │ │  └────────────────┘  │
│  │  [Số nhà, tên đường___________]          │ │                      │
│  │                                          │ │  ─────────────────   │
│  │  Tỉnh/Thành phố *  ▼                     │ │                      │
│  │  [Hà Nội___________________]             │ │  Tạm tính:           │
│  │  (Datalist: Hà Nội, TPHCM, Đà Nẵng...)  │ │  710,000₫            │
│  │                                          │ │                      │
│  └──────────────────────────────────────────┘ │  VAT (10%):          │
│                                                │  71,000₫             │
│  ┌──────────────────────────────────────────┐ │                      │
│  │  Phương thức thanh toán                  │ │  Phí vận chuyển:     │
│  │                                          │ │  22,000₫             │
│  │  (•) VietQR (Chuyển khoản ngân hàng)     │ │  (Đã giảm 25k)       │
│  │      Quét mã QR để chuyển khoản          │ │                      │
│  │                                          │ │  ─────────────────   │
│  │  ( ) PayPal / Thẻ tín dụng               │ │  Tổng thanh toán:    │
│  │      💳 PayPal Sandbox (Demo)            │ │  803,000₫            │
│  │                                          │ │                      │
│  │  ℹ Sau khi đặt hàng, bạn sẽ nhận mã QR  │ │  Trọng lượng:        │
│  │    để thanh toán                          │ │  0.75 kg             │
│  │                                          │ │                      │
│  └──────────────────────────────────────────┘ │                      │
│                                                │  [✓ Xác nhận        │
│                                                │     thanh toán]      │
│                                                │  (Primary, 48px)     │
│                                                │                      │
│                                                │  [← Quay lại        │
│                                                │     giỏ hàng]        │
│                                                │  (Secondary)         │
└────────────────────────────────────────────────┴──────────────────────┘

Shipping Fee Calculation Info Box:
┌─────────────────────────────────────────────────────────────────────┐
│  ℹ Phí vận chuyển                                                    │
│  • Đơn hàng >100k: Miễn phí vận chuyển tối đa 25.000₫               │
│  • HN/TPHCM: 22.000₫ cho 3kg đầu, +2.500₫/0.5kg tiếp                │
│  • Tỉnh khác: 30.000₫ cho 0.5kg đầu, +2.500₫/0.5kg tiếp             │
└─────────────────────────────────────────────────────────────────────┘

Validation Error State:
┌──────────────────────────────────────────┐
│  Số điện thoại *                         │
│  [012345___________________]             │
│  ❌ Số điện thoại phải có 10 chữ số      │
└──────────────────────────────────────────┘

Processing State:
[  ⌛ Đang xử lý...  ]
(Button disabled with spinner)

Mobile View (≤768px):
═════════════════════════════════
║ AIMS    [🛒3]                ║
═════════════════════════════════

     Thanh toán

┌───────────────────────────────┐
│ Thông tin giao hàng           │
│                               │
│ Họ và tên *                   │
│ [___________________]         │
│                               │
│ Số điện thoại *               │
│ [___________________]         │
│                               │
│ Địa chỉ *                     │
│ [___________________]         │
│                               │
│ Tỉnh/TP *  ▼                  │
│ [___________________]         │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Phương thức thanh toán        │
│ (•) VietQR                    │
│ ( ) PayPal                    │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Đơn hàng                      │
│ {Img} Product 1x150k          │
│ {Img} Product 2x280k          │
│                               │
│ Tạm tính:       710,000₫      │
│ VAT:             71,000₫      │
│ Phí ship:        22,000₫      │
│ ─────────────────────         │
│ Tổng:           803,000₫      │
│                               │
│ [✓ Xác nhận thanh toán]       │
│ [← Quay lại giỏ hàng]         │
└───────────────────────────────┘
```

**Component Behaviors:**
- **Form Validation**: Real-time validation on blur, red border + error message
- **City Selector**: Datalist with common cities, affects shipping calculation
- **Payment Radio**: Selecting option shows relevant information box
- **Shipping Fee**: Auto-calculates based on weight and city selection
- **Confirm Button**: Validates all fields, disables during processing, shows spinner
- **Success**: Shows toast, clears cart, redirects to home page

---

### 6.5 Product Management Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store       [Home] [Cart] [Quản lý SP] [User] [👤 PM]   ║
═════════════════════════════════════════════════════════════════════════

Quản lý sản phẩm                    [📜 Lịch sử]  [+ Thêm sản phẩm]

History Panel (Collapsible):
┌─────────────────────────────────────────────────────────────────────┐
│  Lịch sử thao tác                                           [Đóng]  │
│  ─────────────────────────────────────────────────────────────────  │
│  ✅ Thêm mới: The Great Gatsby                                      │
│     Bởi Product Manager - 15/11/2025 10:30                          │
│  ─────────────────────────────────────────────────────────────────  │
│  ✏️ Chỉnh sửa: Thriller - Michael Jackson                           │
│     Bởi Product Manager - 18/11/2025 14:20                          │
│  ─────────────────────────────────────────────────────────────────  │
│  🚫 Vô hiệu hóa: Out of Stock Item                                  │
│     Bởi Product Manager - 20/11/2025 09:15                          │
└─────────────────────────────────────────────────────────────────────┘

Edit/Add Form (Collapsible):
┌─────────────────────────────────────────────────────────────────────┐
│  Chỉnh sửa sản phẩm                                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  Tên sản phẩm                     Giá (VNĐ)                         │
│  [The Great Gatsby_______]        [150000_______]                   │
│                                                                      │
│  Số lượng                         Loại sản phẩm                     │
│  [15__________________]           ▼ [Book_______]                   │
│                                                                      │
│  ❌ Giá phải lớn hơn 0                                               │
│  ❌ Số lượng không được âm                                           │
│                                                                      │
│  [  Lưu  ]  [  Hủy  ]                                               │
└─────────────────────────────────────────────────────────────────────┘

Products Table:
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Sản phẩm          │ Loại  │ Giá          │ Tồn kho │ Trạng thái    │ Thao tác        │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ {Img} The Great  │ BOOK  │ 150,000₫     │   15    │ [Hoạt động]   │ [✏️] [👁️‍🗨️] [🗑️]│
│       Gatsby      │       │              │         │ (Green badge) │                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ {Img} Thriller - │ CD    │ 280,000₫     │   12    │ [Hoạt động]   │ [✏️] [👁️‍🗨️] [🗑️]│
│       MJ          │       │              │         │ (Green badge) │                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ {Img} Old Paper  │ NEWS  │  10,000₫     │    0    │ [Vô hiệu hóa] │ [✏️] [👁️] [🗑️]  │
│                   │       │              │         │ (Red badge)   │ (Delete active) │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ {Img} Harry      │ BOOK  │ 120,000₫     │   30    │ [Hoạt động]   │ [✏️] [👁️‍🗨️] [🗑️]│
│       Potter      │       │              │         │ (Green badge) │ (Delete disabled)│
├──────────────────────────────────────────────────────────────────────────────────────┤
│ {Img} Abbey Road │ CD    │ 320,000₫     │   10    │ [Hoạt động]   │ [✏️] [👁️‍🗨️] [🗑️]│
│                   │       │              │         │ (Green badge) │                 │
└──────────────────────────────────────────────────────────────────────────────────────┘

Action Button States:
✏️ = Edit (always enabled)
👁️‍🗨️ = Deactivate (only if stock > 0, converts to 👁️ Activate if deactivated)
🗑️ = Delete (only enabled if stock = 0, shows tooltip if disabled)

Tooltip on disabled Delete:
┌─────────────────────────────────┐
│ ℹ Chỉ xóa khi tồn kho = 0      │
└─────────────────────────────────┘

Business Rules Panel:
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️ Quy tắc quản lý sản phẩm                                        │
│  • Chỉ xóa sản phẩm khi tồn kho = 0                                 │
│  • Sản phẩm có tồn kho >0 chỉ có thể chuyển sang "deactivated"     │
│  • Tất cả thay đổi được ghi vào lịch sử                             │
└─────────────────────────────────────────────────────────────────────┘

Mobile View (≤768px):
═════════════════════════════════
║ (☰) AIMS  [Quản lý SP] [👤]  ║
═════════════════════════════════

Quản lý sản phẩm

[📜 Lịch sử] [+ Thêm SP]

┌───────────────────────────────┐
│ {Img} The Great Gatsby        │
│ BOOK | 150,000₫ | Stock: 15   │
│ Status: [Hoạt động]           │
│ [✏️] [👁️‍🗨️] [🗑️]               │
├───────────────────────────────┤
│ {Img} Thriller - MJ           │
│ CD | 280,000₫ | Stock: 12     │
│ Status: [Hoạt động]           │
│ [✏️] [👁️‍🗨️] [🗑️]               │
└───────────────────────────────┘
```

**Component Behaviors:**
- **Add Product**: Opens form modal with empty fields, validates on submit
- **Edit Icon**: Opens form pre-filled with product data
- **Deactivate**: Changes isActive to false, updates badge, swaps icon to Activate
- **Delete**: Only enabled when stock = 0, shows confirmation dialog
- **History Panel**: Toggle visibility, shows chronological log of all actions
- **Table Sorting**: Click headers to sort by column
- **Validation**: Real-time validation with error messages below fields

---

### 6.6 User Management Page Wireframe

```
═════════════════════════════════════════════════════════════════════════
║  (Logo) AIMS Store         [Home] [Cart] [User Mgmt] [👤 Admin]       ║
═════════════════════════════════════════════════════════════════════════

Quản lý người dùng                               [+ Tạo người dùng]

Create/Edit User Form (Collapsible):
┌─────────────────────────────────────────────────────────────────────┐
│  Tạo người dùng mới                                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  Họ và tên                        Email                             │
│  [Nguyễn Văn A________]           [user@example.com______]          │
│  ❌ Vui lòng nhập tên                                                │
│                                                                      │
│  Vai trò                          Trạng thái                        │
│  ▼ [Khách hàng________]           ▼ [Hoạt động________]            │
│     - Khách hàng                     - Hoạt động                    │
│     - Quản lý sản phẩm               - Bị chặn                      │
│     - Quản trị viên                                                 │
│                                                                      │
│  [  Tạo  ]  [  Hủy  ]                                               │
└─────────────────────────────────────────────────────────────────────┘

Users Table:
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Người dùng       │ Email              │ Vai trò          │ Trạng thái   │ Thao tác         │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Admin User       │ admin@aims.com     │ [Quản trị viên]  │ [Hoạt động]  │ [✏️][🔒][🔑][🗑️] │
│                  │                    │ (Blue badge)     │ (Green)      │                  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Product Manager  │ pm@aims.com        │ [Quản lý SP]     │ [Hoạt động]  │ [✏️][🔒][🔑][🗑️] │
│                  │                    │ (Blue badge)     │ (Green)      │                  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Customer One     │ customer1@aims.com │ [Khách hàng]     │ [Hoạt động]  │ [✏️][🔒][🔑][🗑️] │
│                  │                    │ (Blue badge)     │ (Green)      │                  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Blocked User     │ blocked@aims.com   │ [Khách hàng]     │ [Bị chặn]    │ [✏️][🔓][🔑][🗑️] │
│                  │                    │ (Blue badge)     │ (Red)        │                  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ Customer Two     │ customer2@aims.com │ [Khách hàng]     │ [Hoạt động]  │ [✏️][🔒][🔑][🗑️] │
│                  │                    │ (Blue badge)     │ (Green)      │                  │
└────────────────────────────────────────────────────────────────────────────────────────────┘

Action Icons Legend:
✏️ = Edit user details
🔒 = Block user (locked icon)
🔓 = Unblock user (unlocked icon)
🔑 = Reset password
🗑️ = Delete user

Email Notification Info Box:
┌─────────────────────────────────────────────────────────────────────┐
│  ✉️ Thông báo Email                                                 │
│  Mỗi khi có thao tác quản trị (tạo, sửa, xóa, block, reset mật     │
│  khẩu), hệ thống sẽ tự động gửi email thông báo đến người dùng.    │
│                                                                      │
│  ℹ️ Trong môi trường demo, các email được mô phỏng qua toast.      │
└─────────────────────────────────────────────────────────────────────┘

Toast Notifications (Examples):
┌────────────────────────────────────┐
│ ✅ Đã tạo người dùng "Nguyễn Văn A"│
│ ✅ Đã gửi email thông báo tới...   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ✅ Đã chặn người dùng "Customer"   │
│ ✅ Đã gửi email thông báo tới...   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ✅ Đã reset mật khẩu cho "Admin"   │
│ ✅ Đã gửi email mật khẩu mới...    │
└────────────────────────────────────┘

Delete Confirmation Dialog:
┌─────────────────────────────────────────────┐
│  ⚠️ Xác nhận xóa                            │
│  ─────────────────────────────────────────  │
│  Bạn có chắc muốn xóa người dùng            │
│  "Customer One"?                            │
│                                             │
│  Hành động này không thể hoàn tác.          │
│                                             │
│      [  Hủy  ]    [  Xóa  ]                 │
│                   (Danger button)           │
└─────────────────────────────────────────────┘

Mobile View (≤768px):
═════════════════════════════════
║ (☰) AIMS  [User Mgmt] [👤]   ║
═════════════════════════════════

Quản lý người dùng

[+ Tạo người dùng]

┌───────────────────────────────┐
│ Admin User                    │
│ admin@aims.com                │
│ [Quản trị viên] [Hoạt động]   │
│ [✏️] [🔒] [🔑] [🗑️]            │
├───────────────────────────────┤
│ Product Manager               │
│ pm@aims.com                   │
│ [Quản lý SP] [Hoạt động]      │
│ [✏️] [🔒] [🔑] [🗑️]            │
├───────────────────────────────┤
│ Customer One                  │
│ customer1@aims.com            │
│ [Khách hàng] [Hoạt động]      │
│ [✏️] [🔒] [🔑] [🗑️]            │
└───────────────────────────────┘

[✉️ Info: Email thông báo tự động...]
```

**Component Behaviors:**
- **Create User**: Opens form, validates email uniqueness, sends notification email
- **Edit Icon**: Opens pre-filled form, allows changing all fields except ID
- **Block/Unblock**: Toggles user status, icon changes 🔒↔🔓, sends email
- **Reset Password**: Generates new password, sends to user email, shows success toast
- **Delete**: Shows confirmation dialog, removes user, sends notification email
- **Role Change**: Updates user permissions, affects menu visibility for that user
- **Email Notifications**: All admin actions trigger email notifications (simulated via toast in demo)

---

## 7. Component Behavior Guide

### 7.1 Common Interactive Patterns

#### Search & Filter Behavior
- **Debouncing**: Search input triggers filtering after 300ms pause in typing
- **Filter Combination**: Multiple filters combine with AND logic
- **Clear Filters**: X button appears to clear all filters at once
- **Results Count**: Always display "Found X products" below filters

#### Form Validation
1. **On Blur**: Validate field when user leaves the input
2. **On Submit**: Validate all fields before allowing submission
3. **Error Display**: Red border + error message below field
4. **Success State**: Green border when valid input entered
5. **Required Fields**: Mark with red asterisk (*) in label

#### Cart Operations
- **Add to Cart**: Validates stock, updates header badge, shows toast
- **Update Quantity**: Real-time validation, disables +/- at limits
- **Remove Item**: Shows confirmation toast after removal
- **Stock Warning**: Red text + warning icon when quantity exceeds stock

#### Modal/Dialog Behavior
- **Open**: Fade in animation, blur background
- **Close**: ESC key, X button (top-right), or outside click
- **Focus Trap**: Tab navigation stays within modal
- **Primary Action**: Enter key triggers confirm button

#### Loading States
- **Button**: Show spinner, disable, change text to "Processing..."
- **Page**: Full-page spinner with translucent overlay
- **Skeleton**: Use placeholder cards for loading content
- **Progress**: Show progress bar for multi-step operations

#### Error Handling
- **Network Error**: Show retry button with error message
- **Validation Error**: Inline error below field with specific guidance
- **Permission Error**: Show message with role requirement
- **404 Error**: Friendly message with link back to home

### 7.2 Accessibility Features

| Feature | Implementation |
|---------|---------------|
| **Keyboard Navigation** | All interactive elements accessible via Tab, Enter, Space |
| **Focus Indicators** | Visible blue outline on focused elements |
| **ARIA Labels** | Descriptive labels for screen readers |
| **Color Contrast** | WCAG AA compliance (4.5:1 for text) |
| **Alt Text** | Descriptive alt text for all images |
| **Skip Links** | "Skip to content" link for keyboard users |

### 7.3 Responsive Behavior

#### Desktop (≥1024px)
- Full width layout with sidebars
- 4-column product grid
- Horizontal navigation menu
- Sticky header and cart summary
- Hover effects on cards and buttons

#### Tablet (768px - 1023px)
- 2-3 column product grid
- Collapsible sidebars
- Same navigation structure
- Touch-optimized button sizes (min 44px)

#### Mobile (≤767px)
- Single column layout
- Hamburger menu
- Stacked forms (one field per row)
- Bottom sticky action buttons
- Swipeable carousels
- Touch gestures for quantity controls

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 21/11/2025 | Initial document creation with all wireframes | AIMS Team |

---

**End of Document**

*This document is ready for PDF export and submission. All screens include detailed wireframes, behavior specifications, and standardization guidelines.*
