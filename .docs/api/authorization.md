# Authorization (Phân quyền)

Sau bước Xác thực (Authentication) bằng Token, hệ thống sử dụng **Bouncer** (của AdonisJS) và các **Middleware** tùy chỉnh để kiểm soát quyền truy cập tài nguyên.

## Các Middleware Phân Quyền Chính

### 1. `middleware.admin()`

- **Policy liên kết**: `AdminPolicy`
- **Điều kiện**: User phải có Role là `ADMIN`.
- **Lỗi khi vi phạm**: Trả về HTTP `403 Forbidden` với message: `Bạn không có quyền thực hiện chức năng này`.
- **Sử dụng**: Dùng cho toàn bộ các route admin (prefix `/api/v1/admin/*`).

### 2. `middleware.driver()`

- **Policy liên kết**: `DriverPolicy`
- **Điều kiện**: User phải có Role là `DRIVER`.
- **Lỗi khi vi phạm**: Trả về HTTP `403 Forbidden` với message: `Bạn không có quyền thực hiện chức năng này`.
- **Sử dụng**: Dùng cho các route dành riêng cho tài xế giao hàng (prefix `/api/v1/driver/*`).

## Enum Role

Trong hệ thống (bảng `users`), phân quyền cấp cao nhất dựa trên trường `role`.
(Xem định nghĩa enum Role trong code để biết các hằng số chính xác).
