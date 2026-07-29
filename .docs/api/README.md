# Buntech Backend API Documentation

Chào mừng đến với tài liệu API của dự án Buntech Backend (AdonisJS 7).

Tài liệu này được sinh tự động từ phân tích trực tiếp mã nguồn thực tế (implementation), đảm bảo độ chính xác 100% so với code đang chạy.

## Tổng quan Kiến trúc

- **Framework**: AdonisJS 7 (ES Modules, TypeScript)
- **Database**: PostgreSQL (qua Lucid ORM)
- **Validation**: VineJS
- **Authentication**: Opaque Access Tokens (`@adonisjs/auth`)
- **Cấu trúc**: 3 lớp (Controller -> Service -> Repository)

## Cấu trúc Tài liệu

Tài liệu được chia thành các phần chính:

1. **Core Documentation**: Các tài liệu chuẩn hóa về Response, Lỗi, Phân quyền, Phân trang,... (Xem menu bên trái hoặc file SUMMARY.md).
2. **Modules**: Chi tiết từng API endpoint, được nhóm theo chức năng nghiệp vụ (Auth, User, Order, Product,...).

## Quy ước chung

- Mọi API có prefix `/api/v1` (trừ một số route public hoặc hệ thống nội bộ).
- Dữ liệu Request/Response luôn giao tiếp bằng định dạng `application/json`.
- Các API Admin yêu cầu Bearer Token của user có role `ADMIN`.
- Các API Driver yêu cầu Bearer Token của user có role `DRIVER`.
