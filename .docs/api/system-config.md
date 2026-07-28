# System Config Module API Specification

Tài liệu này phục vụ cho chức năng thay đổi cài đặt nhanh toàn cục, ví dụ thay đổi SĐT Hotline dưới Footer Website.

---

## 1. GET `/api/v1/admin/system-configs`

### 1. Tổng quan
- **Tên API**: Lấy cấu hình hệ thống (Dạng List)
- **Method**: `GET`
- **Permission**: Admin

### 2. Mục đích
Nạp tất cả cấu hình như `COMPANY_PHONE`, `COMPANY_EMAIL`, `HEADER_BANNER_TEXT` để cho Admin Form chỉnh sửa.

### 7. Response
- Mảng các Object chứa `{ id, key, value, description }`.

---

## 2. GET `/api/v1/system-configs/:key` (Public Client)

### 1. Tổng quan
- **Tên API**: Lấy một cấu hình cụ thể
- **Method**: `GET`
- **Permission**: Public

### 2. Mục đích
Khi Render Website Public (Next.js / Vue), FE có thể GET thẳng key để chèn text vào Footer hoặc Header.

### 11. Cache Strategy *(Recommended Practice)*
- Config cực hiếm khi đổi. FE Bắt buộc Cache hoặc dùng SSG (Static Site Generation) cho API này để tiết kiệm hoàn toàn truy vấn.

---

## 3. GET `/api/v1/constants`

### 1. Tổng quan
- **Tên API**: Lấy tất cả Enum và Constants
- **Method**: `GET`
- **Permission**: Public

### 2. Mục đích
- Cung cấp toàn bộ danh sách Enum (`Role`, `CustomerType`, `OrderStatus`, `DeliveryStatus`...) đang được dùng dưới Backend để Frontend không cần hardcode String.

### 7. Response
- Trả về object chứa các object config nội bộ.
- Dữ liệu mẫu:
```json
{
  "success": true,
  "data": {
    "Role": { "ADMIN": "admin", "DRIVER": "driver", "CUSTOMER": "customer", "GUEST": "guest" },
    "CustomerType": { "WHOLESALE": "wholesale", "RETAIL": "retail" }
    // ...
  }
}
```

### 11. Cache Strategy *(Recommended Practice)*
- Enum gần như KHÔNG BAO GIỜ THAY ĐỔI lúc runtime (phải deploy lại backend mới đổi).
- Frontend NÊN fetch API này một lần khi Boot App và lưu vào Global State (Redux, Zustand) hoặc LocalStorage để tái sử dụng mãi mãi.
