# Inventory Module API Specification

Tài liệu này cung cấp hướng dẫn tương tác với hệ thống Quản lý Kho, Nguyên Vật Liệu (Raw Materials) dành cho khối Kế toán / Quản kho.

---

## 1. POST `/api/v1/admin/inventory/import`

### 1. Tổng quan
- **Tên API**: Nhập kho vật liệu
- **Method**: `POST`
- **Module**: Inventory
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Thực hiện thao tác cộng dồn số lượng tồn kho của một nguyên vật liệu cụ thể. Ghi vết (Log) lại quá trình này để đối soát.

### 3. Khi nào Frontend nên gọi
- Khi Kế toán kho tạo xong Phiếu Nhập Kho hoặc Mua thêm nguyên vật liệu mới.

### 5. Request
- **Body**:
  - `materialId` (number, **required**): ID của Raw Material.
  - `quantity` (number, **required**): Số lượng nhập thêm (Phải > 0).
  - `note` (string, optional): Ghi chú (Ví dụ: "Nhập hàng lô tháng 10").
  - `referenceId` (string, optional): Mã Phiếu Nhập Kho giấy hoặc Số Hóa Đơn Mua Hàng gốc.

### 6. Business Rule
- **Lock row vật liệu (`forUpdate`)**: Database sẽ chặn luồng song song để đảm bảo nếu có 2 kế toán cùng bấm Nhập Kho một vật liệu, số liệu tồn kho sẽ được cộng dồn tuần tự và chính xác tuyệt đối.
- Số lượng `currentStock` (Tồn kho hiện tại) = `currentStock` + `quantity`.
- Tự động lưu 1 bản ghi vào bảng `inventory_logs` với `type = IMPORT`.
- Bọc toàn bộ trong DB Transaction.

### 7. Response
- Trả về đối tượng `{ material, log }`.

### 12. Retry Strategy *(Recommended Practice)*
- **KHÔNG Retry**. Việc retry khi lỗi mạng có rủi ro cộng dồn số lượng 2 lần (dẫn tới lệch tồn kho). FE hãy hiện thông báo đỏ yêu cầu tải lại trang để kiểm tra số tồn hiện tại trước khi thử nhập lại.

---

## 2. Các API CRUD `/api/v1/admin/raw-materials`

### 1. Tổng quan
- **Tên API**: Quản lý danh mục Nguyên Vật Liệu
- **Method**: `GET`, `POST`, `PUT`, `DELETE`
- **Permission**: Admin

### 2. Mục đích
- Quản lý danh mục tên nguyên vật liệu, đơn vị tính.

### 5. Request
- `GET /api/v1/admin/raw-materials`: Lấy danh sách (Có phân trang).
- `GET /api/v1/admin/raw-materials/:id`: Lấy chi tiết.
- `POST /api/v1/admin/raw-materials`: Tạo mới.
- `PUT /api/v1/admin/raw-materials/:id`: Cập nhật.
- `DELETE /api/v1/admin/raw-materials/:id`: Xóa.

### 6. Business Rule
- Trả về danh mục các nguyên vật liệu, tập trung vào cột `currentStock` (Tồn kho hiện hữu) và `unit` (Đơn vị tính - kg, cái, bao...).
- Việc thay đổi `currentStock` nên được thực hiện thông qua API Nhập Kho (`/api/v1/admin/inventory/import`) chứ không nên sửa tay qua CRUD để đảm bảo có Log.

