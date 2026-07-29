# Users Module

Module này cung cấp các API để quản trị viên (Admin) quản lý Người dùng (Users), Địa chỉ giao hàng (Addresses), và cài đặt Bảng giá riêng cho khách sỉ (Customer Prices).

Tất cả các API trong module này đều có prefix `/api/v1/admin/users` và yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Người dùng (Users)

### 1.1 Lấy danh sách người dùng
- **Method**: `GET /`
- **Query Params**: `page`, `limit`, `role` (Lọc theo vai trò).
- **Mục đích**: Lấy danh sách phân trang người dùng trong hệ thống.

### 1.2 Tạo người dùng
- **Method**: `POST /`
- **Request Body (JSON)**:
  - `phoneNumber` (String, required, regex: `^[0-9]{10,11}$`, unique)
  - `password` (String, required, min length 6)
  - `fullName` (String, required, max 100)
  - `role` (Enum `Role`, required)
  - `customerType` (Enum `CustomerType`, optional)
- **Mục đích**: Tạo người dùng mới và tự động tạo `profile` rỗng kèm theo.

### 1.3 Chi tiết người dùng
- **Method**: `GET /:id`
- **Mục đích**: Xem chi tiết thông tin và hồ sơ người dùng.

### 1.4 Cập nhật cơ bản
- **Method**: `PUT /:id`
- **Request Body (JSON)**:
  - `fullName` (String, optional, max 100)
  - `role` (Enum `Role`, optional)
  - `customerType` (Enum `CustomerType`, optional)
- **Mục đích**: Cập nhật thông tin cơ bản.

### 1.5 Cập nhật Profile (Hạn mức nợ)
- **Method**: `PUT /:id/profile`
- **Request Body (JSON)**:
  - `debtLimit` (Number, optional, min 0)
  - `storeName` (String, optional, max 200)
  - `zaloUserId` (String, optional)
  - `avatarUrl` (String, optional)
- **Mục đích**: Admin cập nhật các thông tin đặc thù của khách sỉ như Hạn mức nợ (`debtLimit`), Tên cửa hàng (`storeName`), Zalo ID...

### 1.6 Đổi mật khẩu
- **Method**: `PUT /:id/change-password`
- **Request Body (JSON)**:
  - `password` (String, required, min length 6)
- **Mục đích**: Admin ép đổi/cấp lại mật khẩu cho user.

### 1.7 Xóa người dùng
- **Method**: `DELETE /:id`

---

## 2. Sổ địa chỉ (Addresses)

Một user có thể có nhiều địa chỉ giao hàng. Các API này được lồng ghép (nested) dưới dạng `/api/v1/admin/users/:userId/addresses`.

### 2.1 Danh sách địa chỉ
- **Method**: `GET /`
- **Mục đích**: Lấy mảng địa chỉ của một user cụ thể. Không phân trang vì danh bạ thường ngắn.

### 2.2 Tạo địa chỉ mới
- **Method**: `POST /`
- **Request Body (JSON)**:
  - `addressLine` (String, required, max 255)
  - `province` (String, optional, max 100)
  - `ward` (String, optional, max 100)
  - `latitude` (String, optional, max 50)
  - `longitude` (String, optional, max 50)
  - `isDefault` (Boolean, optional)
- **Business Flow**: Nếu truyền `isDefault: true`, hệ thống sẽ tự động set các địa chỉ khác của user này về `isDefault: false`.

### 2.3 Xem chi tiết, Cập nhật, Xóa
- **Chi tiết**: `GET /:id`
- **Cập nhật**: `PUT /:id`
  - **Request Body**: Tương tự Create nhưng tất cả các field là Optional.
- **Xóa**: `DELETE /:id`

---

## 3. Bảng giá riêng (Customer Prices)

Buntech có cơ chế Bảng Giá Riêng cho khách sỉ. Khi khách sỉ đặt hàng, hệ thống sẽ tự động quét bảng giá này để áp dụng thay vì lấy giá gốc của sản phẩm.
Các API nested dưới dạng `/api/v1/admin/users/:userId/custom-prices`.

### 3.1 Danh sách giá riêng đã cài
- **Method**: `GET /`
- **Query**: `page`, `limit` (Phân trang).
- **Mục đích**: Lấy các sản phẩm đã được cài giá ưu đãi cho khách hàng này.

### 3.2 Cài đặt / Cập nhật giá bán riêng (Upsert)
- **Method**: `POST /`
- **Request Body (JSON)**: 
  - `productId` (Number, required, positive)
  - `customPrice` (Number, required, positive)
- **Mục đích**: Nếu chưa có thì thêm mới, nếu có rồi thì cập nhật.

### 3.3 Xóa giá bán riêng
- **Method**: `DELETE /:productId`
- **Mục đích**: Xóa mức giá riêng của 1 sản phẩm. Lần mua tiếp theo, khách sẽ mua với giá gốc (Retail Price) của sản phẩm đó.
