# Buntech Backend API Documentation

Chào mừng đến với tài liệu API của dự án Buntech Backend (AdonisJS 7).

Tài liệu này được sinh tự động từ phân tích trực tiếp mã nguồn thực tế (implementation), đảm bảo độ chính xác 100% so với code đang chạy. Bổ sung thêm các ghi chú nghiệp vụ và sơ đồ logic chi tiết.

## Tổng quan Kiến trúc

- **Framework**: AdonisJS 7 (ES Modules, TypeScript)
- **Database**: PostgreSQL (qua Lucid ORM)
- **Validation**: VineJS
- **Authentication**: Opaque Access Tokens (`@adonisjs/auth`)
- **Cấu trúc**: 3 lớp (Controller -> Service -> Repository)

## Cấu trúc Tài liệu

Tài liệu được chia thành các phần chính:

1. **Core Documentation**: Các tài liệu chuẩn hóa về Response, Lỗi, Phân quyền, Phân trang,... (Xem menu bên trái hoặc file SUMMARY.md).
2. **Modules**: Chi tiết từng API endpoint, được nhóm theo chức năng nghiệp vụ (Auth, User, Order, Product,...). Trong mỗi module, các API sẽ có schema Request/Response rõ ràng.

## Tài nguyên Postman & Swagger

Bên cạnh tài liệu Markdown (tập trung vào luồng Business Flow), BE cũng cung cấp các cấu trúc máy đọc được (Machine-readable) phục vụ cho Frontend:

1. **Swagger UI**: Các bạn có thể truy cập `GET /docs` trên môi trường dev để xem giao diện Swagger và test API trực tiếp (Dựa trên cấu hình `swagger.json`).
2. **Postman Collection v2.1**: Trong thư mục root của dự án BE, sẽ luôn có sẵn 1 file export định dạng `Postman Collection v2.1` chứa toàn bộ API và Schema được khai báo đầy đủ các trường (Number/String/Nullable/Mảng). Frontend có thể import trực tiếp file này vào Postman để test mà không cần tự tạo bằng tay.

## Quy ước chung

- Mọi API có prefix `/api/v1` (trừ một số route public hoặc hệ thống nội bộ).
- Dữ liệu Request/Response luôn giao tiếp bằng định dạng `application/json`.
- Các API Admin yêu cầu Bearer Token của user có role `ADMIN`.
- Các API Driver yêu cầu Bearer Token của user có role `DRIVER`.
