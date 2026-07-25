# Quy ước chung (Conventions)

## 1. Cấu trúc Response chung

Tất cả API đều trả về format chuẩn của hệ thống:
`	ypescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T; // Dữ liệu trả về hoặc null (nếu lỗi)
  errors?: any; // Mảng lỗi nếu gọi thất bại
}
`

## 2. Authentication
- Authorization Header: Bearer <access_token>

## 3. Mã lỗi tiêu chuẩn (HTTP Status Codes)
- 200 OK: Thành công.
- 201 Created: Tạo mới thành công.
- 400 Bad Request: Lỗi logic (BusinessException), dữ liệu đầu vào không hợp lệ.
- 401 Unauthorized: Chưa đăng nhập hoặc token hết hạn.
- 403 Forbidden: Không đủ quyền (Role Admin, Driver).
- 404 Not Found: Không tìm thấy tài nguyên.
- 422 Unprocessable Entity: Validation Error (VineJS).
- 429 Too Many Requests: Vi phạm Throttle (Spam request).
- 500 Internal Server Error: Lỗi hệ thống.
