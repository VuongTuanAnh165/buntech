# System Module

Module bao gồm các chức năng cốt lõi của hệ thống như Quản lý Cấu hình (System Configs), Upload File, và Xuất Dữ liệu (Exports).

Tất cả các API trong module này yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Cấu hình Hệ thống (System Configs)

API quản lý các cấu hình động dạng Key-Value (Ví dụ: `maintain_mode`, `freeship_threshold`,...).

### 1.1 Lấy danh sách cấu hình
- **URL**: `GET /api/v1/admin/system-configs`
- **Mục đích**: Lấy danh sách cấu hình động (hỗ trợ phân trang).

### 1.2 Tạo cấu hình mới
- **URL**: `POST /api/v1/admin/system-configs`
- **Request Body (JSON)**:
  - `key` (String, required, max 100, unique)
  - `value` (String, required)
  - `description` (String, optional, max 255)

### 1.3 Cập nhật, Xem, Xóa cấu hình
- **Chi tiết**: `GET /api/v1/admin/system-configs/:id` (với `id` là key của cấu hình)
- **Cập nhật**: `PUT /api/v1/admin/system-configs/:id`
  - **Request Body (JSON)**:
    - `value` (String, required)
    - `description` (String, optional, max 255)
- **Xóa**: `DELETE /api/v1/admin/system-configs/:id`

---

## 2. Xuất dữ liệu (Exports)

Các API này không trả về JSON mà trả về định dạng **File Stream** (Ví dụ: `text/csv`) để trình duyệt tự động tải xuống.

### 2.1 Xuất đơn hàng theo ngày
- **URL**: `GET /api/v1/admin/exports/orders-today`
- **Mục đích**: Xuất nhanh các đơn hàng trong ngày hôm nay.
- **Response**: Trả về một file CSV đính kèm (Header `Content-Disposition: attachment; filename="Export_Orders_Today_YYYY_MM_DD.csv"`).

---

## 3. Upload File
(Xem tài liệu chi tiết tại file [Upload File](../upload.md)).
- **URL**: `POST /api/v1/admin/upload`

---

## 4. Server-Sent Events (SSE)

- **URL**: `GET /api/v1/admin/events/sse`
- **Mục đích**: Luồng kết nối 1 chiều (Server bắn về Client) phục vụ tính năng Real-time Dashboard, thông báo chốt đơn từ Tài xế.
- **Header Response**: `Content-Type: text/event-stream`
- **Event Flow**:
  - Khi Tài xế chốt đơn thành công, Server sẽ đẩy stream event `order:delivered`.
  - Frontend chỉ cần dùng `EventSource('/api/v1/admin/events/sse')` để hứng event và tự render UI mà không cần gọi API Polling.
