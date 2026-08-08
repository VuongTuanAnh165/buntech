export enum HttpStatus {
  OK = 200, // Yêu cầu thành công
  CREATED = 201, // Tạo mới tài nguyên thành công
  NO_CONTENT = 204, // Xử lý thành công nhưng không có dữ liệu trả về
  NOT_MODIFIED = 304, // Không có sự thay đổi so với cache
  BAD_REQUEST = 400, // Yêu cầu không hợp lệ (lỗi logic hoặc dữ liệu)
  UNAUTHORIZED = 401, // Lỗi chưa xác thực (chưa đăng nhập hoặc token hết hạn)
  FORBIDDEN = 403, // Lỗi không có quyền truy cập (thiếu quyền)
  NOT_FOUND = 404, // Không tìm thấy tài nguyên
  CONFLICT = 409, // Lỗi xung đột dữ liệu (Trùng lặp Unique Constraint)
  UNPROCESSABLE_ENTITY = 422, // Lỗi dữ liệu đầu vào (Validation error)
  INTERNAL_SERVER_ERROR = 500, // Lỗi nội bộ máy chủ (Exception/Bug)
}
