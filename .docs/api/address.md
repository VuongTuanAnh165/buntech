# Address Module API Specification

Tài liệu này hướng dẫn thao tác với Sổ địa chỉ của từng người dùng cụ thể.

---

## 1. GET `/api/v1/admin/users/:userId/addresses`

### 1. Tổng quan
- **Tên API**: Lấy danh sách địa chỉ của Khách hàng
- **Method**: `GET`
- **Module**: Addresses
- **Permission**: Admin

### 5. Request
- **Path Params**: 
  - `userId` (number): Bắt buộc.

### 7. Response
- Mảng các Object Address.

---

## 2. POST `/api/v1/admin/users/:userId/addresses`

### 1. Tổng quan
- **Tên API**: Thêm mới Sổ địa chỉ cho khách
- **Method**: `POST`

### 5. Request
- **Body**:
  - `province` (string, **required**): Tên Tỉnh (Hoặc Tên Quận - tùy theo cấp).
  - `ward` (string, **required**): Tên Phường (Hoặc tên Huyện).
  - `addressLine` (string, **required**): Số nhà, tên đường. Cụ thể.

**Field Explanation**:
- `province` và `ward`: Dữ liệu này phải được trích xuất từ dữ liệu chuẩn của API Master Data (Name), tránh nhập text tự do.

### 6. Business Rule
- Tạo ra 1 dòng Address mới gắn với `user_id` ở URL. Không có giới hạn số lượng địa chỉ một người có thể có.

---

## 3. PUT `/api/v1/admin/users/:userId/addresses/:id`
*(Tương tự, đổi Request Body như POST để sửa địa chỉ)*

## 4. DELETE `/api/v1/admin/users/:userId/addresses/:id`
- Thực hiện Hard Delete (xóa cứng khỏi CSDL). Các đơn hàng cũ đã chốt vẫn giữ ID địa chỉ này nên cẩn thận khi dùng API xóa. 
- Lỗi 400 nếu địa chỉ này đang được gán cho 1 Order PENDING.
