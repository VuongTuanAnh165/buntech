# Inventory Module (Kho vận)

Module này quản lý danh mục Nguyên vật liệu (Raw Materials) và thực hiện nghiệp vụ Nhập/Xuất Kho (Inventory).

Tất cả các API trong module này đều có prefix `/api/v1/admin/raw-materials` hoặc `/api/v1/admin/inventory` và yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Quản lý Nguyên vật liệu (Raw Materials)

Đóng vai trò Master Data cho các loại nguyên liệu (Ví dụ: Bột mì, Đường, Trứng...) dùng trong sản xuất/chế biến.

### 1.1 Lấy danh sách nguyên vật liệu
- **URL**: `GET /api/v1/admin/raw-materials`
- **Query Params**:
  - `page`, `limit` (Phân trang)
  - `search` (Lọc theo tên hoặc mã)

### 1.2 Chi tiết nguyên vật liệu
- **URL**: `GET /api/v1/admin/raw-materials/:id`
- **Response**: Trả về thông tin chi tiết (tên, quy cách, đơn vị tính, tồn kho hiện tại...).

### 1.3 Tạo mới nguyên vật liệu
- **URL**: `POST /api/v1/admin/raw-materials`
- **Request Body (JSON)**:
  - `name` (String, required, max 255)
  - `unit` (String, required, max 50) - Ví dụ: kg, lít, cái...

### 1.4 Cập nhật thông tin
- **URL**: `PUT /api/v1/admin/raw-materials/:id`
- **Request Body (JSON)**: Tương tự Create nhưng tất cả field là Optional.

### 1.5 Xóa nguyên vật liệu
- **URL**: `DELETE /api/v1/admin/raw-materials/:id`
- **Ghi chú**: API gọi Service để thực hiện **Soft delete** (Xóa mềm), nhằm bảo toàn lịch sử Nhập/Xuất kho trước đó.

---

## 2. Quản lý Tồn kho (Inventory)

Thực hiện các thao tác tăng/giảm số lượng tồn kho của Nguyên vật liệu.

### 2.1 Nhập kho (Import)
- **URL**: `POST /api/v1/admin/inventory/import`
- **Mục đích**: Cộng dồn số lượng nguyên vật liệu vào Tồn kho hiện tại. Tự động sinh ra Log nhập kho để truy xuất nguồn gốc.
- **Request Body (JSON)**:
  - `materialId` (Number, required, positive)
  - `quantity` (Number, required, positive)
  - `note` (String, optional, max 255)
  - `referenceId` (String, optional, max 100) - Mã phiếu nhập tham chiếu.
- **Business Flow**:
  1. Validator kiểm tra ID nguyên liệu và số lượng nhập.
  2. Truyền `userId` của Admin đang thao tác (lấy từ HTTP Context).
  3. Mở Database Transaction: Cộng dồn số lượng vào bảng `raw_materials`.
  4. Ghi một dòng log vào bảng lịch sử tồn kho (Ví dụ: `inventory_logs`).
