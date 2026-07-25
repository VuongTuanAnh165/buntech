# Admin Order Module API Specification

Tài liệu này mô tả chi tiết các API dành cho Quản trị viên (Admin) để khởi tạo, điều phối, và cập nhật trạng thái đơn hàng.

---

## 1. GET `/api/v1/admin/orders`

### 1. Tổng quan
- **Tên API**: Lấy danh sách Đơn hàng
- **URL**: `/api/v1/admin/orders`
- **Method**: `GET`
- **Module**: Admin Orders
- **Phiên bản API**: v1
- **Authentication Required**: Yes
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Cho phép Admin lấy danh sách các đơn hàng trong hệ thống để quản lý, in hóa đơn, hoặc phân công cho tài xế.

### 3. Khi nào Frontend nên gọi
- Admin mở màn hình "Quản lý đơn hàng" / "Điều phối đơn hàng".
- Admin thực hiện tìm kiếm / lọc (filter).
- Chuyển trang (Pagination).

### 4. Khi nào KHÔNG nên gọi
- User thường (Customer) hoặc Driver không bao giờ gọi API này.

### 5. Request
- **Query**:
  - `page` (number, default: 1): Số trang.
  - `limit` (number, default: 20): Số lượng dòng (Tối đa 100).
  - `status` (string, optional): Lọc theo trạng thái đơn (`PENDING`, `PROCESSING`, `DELIVERING`, `DELIVERED`, `CANCELED`).
  - `userId` (number, optional): Lọc theo ID khách hàng.
  - `driverId` (number, optional): Lọc theo ID tài xế.

**Field Explanation**:
- Phân trang chuẩn Adonis. Sử dụng query để Backend gọt dữ liệu tránh phình to.

### 6. Business Rule
- Dữ liệu luôn được Sort theo `created_at` giảm dần (đơn mới nhất lên đầu).
- Danh sách trả về không bao gồm chi tiết từng món hàng (Không preload items), chỉ load thông tin Tóm tắt của Khách hàng và Tài xế để tăng tốc độ truy vấn.

### 7. Response
- **Response DTO**: `PaginatedOrderAdminListResponse`
- **Body**:
  - `meta`: Dữ liệu phân trang (total, perPage, currentPage).
  - `data`: Mảng các `Order` summary.
    - `id`, `totalAmount`, `status`, `createdAt`.
    - `user`: Object `{ id, fullName, phoneNumber }`.
    - `driver`: Object `{ id, fullName, phoneNumber }` (Có thể `null` nếu chưa phân công).

**Field Explanation**:
- `totalAmount`: Kiểu String, FE phải convert Float.
- `driver`: Nullable nếu đơn hàng mới vào (`PENDING`) chưa có ai giao.

### 8. Error Handling
- `401 / 403`: Lỗi truy cập. Màn hình tự văng ra ngoài.

### 9. Frontend Workflow
- **Cập nhật Store**: Đưa data vào danh sách DataGrid (Table).
- Cập nhật URL Query params (để giữ trạng thái lọc/phân trang khi refresh F5).

### 10. Loading Strategy *(Recommended Practice)*
- Skeleton loading cho Data Table. Giữ UI cũ, phủ lớp mờ (backdrop) khi chuyển trang.

### 11. Cache Strategy *(Recommended Practice)*
- **Keep-alive / SWR**: Cấu hình stale time tầm 10-20 giây. Bất kỳ lúc nào đơn thay đổi trạng thái, phải Invalidate lại Cache này.

### 12. Retry Strategy *(Recommended Practice)*
- Tự động retry 1 lần khi gặp Network error.

### 13. Side Effect
- Thuần tuý là lệnh đọc.

---

## 1b. GET `/api/v1/admin/orders/:id`

### 1. Tổng quan
- **Tên API**: Lấy chi tiết đơn hàng
- **Method**: `GET`
- **Permission**: Admin

### 5. Request
- **Path Params**:
  - `id`: ID đơn hàng.

### 7. Response
- Trả về đối tượng `Order` chi tiết, bao gồm `items` (chi tiết sản phẩm), `user`, `driver`, và `shippingAddress`.

---

## 2. POST `/api/v1/admin/orders`

### 1. Tổng quan
- **Tên API**: Tạo đơn hàng thủ công (Admin)
- **URL**: `/api/v1/admin/orders`
- **Method**: `POST`
- **Module**: Admin Orders
- **Phiên bản API**: v1
- **Authentication Required**: Yes
- **Permission**: Admin

### 2. Mục đích
Chức năng cho nhân viên tổng đài tạo đơn hàng thay cho khách khi khách gọi điện thoại mua (Ví dụ: Khách sỉ chốt đơn qua Zalo).

### 3. Khi nào Frontend nên gọi
- Sau khi Submit form "Tạo đơn hàng".

### 4. Khi nào KHÔNG nên gọi
- Thiếu thông tin User, Address hoặc giỏ hàng trống.

### 5. Request
- **Body**:
  - `userId` (number, **required**): ID khách hàng.
  - `shippingAddressId` (number, **required**): ID địa chỉ của khách hàng đó.
  - `note` (string, optional): Ghi chú giao hàng.
  - `deliveryDate` (date ISO, optional): Ngày dự kiến giao.
  - `items` (Array, **required**): Danh sách sản phẩm mua.
    - `productId` (number).
    - `quantity` (number).

### 6. Business Rule
- **CRITICAL**: Backend sẽ BỎ QUA giá (`unitPrice`) từ Frontend. Thay vào đó, Backend tự động nội suy giá chuẩn thông qua `OrderCalculatorService`. Dịch vụ này ưu tiên lấy **Bảng Giá Riêng (Custom Price)** của khách hàng (nếu có), ngược lại lấy **Bảng Giá Gốc (Base Price)**.
- Gắn nhãn `source = ADMIN`.
- Trạng thái khởi tạo luôn là `PENDING`.

### 7. Response
- Trả về đối tượng `Order` vừa tạo (bao gồm `id`, `totalAmount` thực tế).

### 8. Error Handling
- `400 Bad Request`: Sản phẩm không tồn tại, số lượng <= 0, lỗi logic.
  - *FE xử lý*: Hiển thị thông báo.
- `422`: Lỗi form validation.

### 9. Frontend Workflow
- Invalidate danh sách Đơn hàng (mục số 1).
- Chuyển hướng sang màn hình Chi tiết Đơn hàng hoặc Quay lại danh sách.

### 13. Side Effect
- **Ghi Database**: Insert bảng `orders` và bảng `order_items` qua DB Transaction.

---

## 3. PATCH `/api/v1/admin/orders/batch-assign`

### 1. Tổng quan
- **Tên API**: Gán/Điều phối tài xế hàng loạt
- **URL**: `/api/v1/admin/orders/batch-assign`
- **Method**: `PATCH`

### 2. Mục đích
Chức năng "Điều phối" buổi sáng. Admin gom nhiều đơn hàng và giao chung cho 1 tài xế chạy theo thứ tự nhất định.

### 5. Request
- **Body**:
  - `driverId` (number, **required**): ID Tài xế.
  - `orders` (Array, **required**): Danh sách các đơn gán cho tài xế này.
    - `orderId` (number).
    - `routeOrder` (number): Thứ tự đi giao.

**Field Explanation**:
- `routeOrder`: Ví dụ [Đơn A: 1, Đơn B: 2]. Tài xế trên App sẽ thấy đơn A trước.

### 6. Business Rule
- Nếu đơn hàng đang ở trạng thái `PENDING` hoặc `PROCESSING`, Backend tự động cập nhật trạng thái lên `DELIVERING` (Đang giao).
- Lock row hoặc chạy Transaction hàng loạt trên Database.

### 9. Frontend Workflow
- Refresh lại Bảng Danh sách Đơn hàng và Lịch trình tài xế.

---

## 4. PATCH `/api/v1/admin/orders/:id/status`

### 1. Tổng quan
- **Tên API**: Cập nhật trạng thái thủ công
- **URL**: `/api/v1/admin/orders/:id/status`
- **Method**: `PATCH`

### 5. Request
- **Body**:
  - `status` (string, optional).
  - `deliveryStatus` (string, optional).
  - `paymentStatus` (string, optional).

### 6. Business Rule
- Admin dùng để Ghi đè trạng thái khi có sự cố. Trực tiếp ghi đè bảng CSDL.
- **Lưu ý CỰC KỲ QUAN TRỌNG**: Cập nhật trạng thái thủ công qua API này **KHÔNG** làm thay đổi công nợ của khách. Nếu đổi trạng thái `paymentStatus` thành `PAID` bằng tay, công nợ trên user_profiles vẫn không bị trừ. Dùng cẩn thận. (Nếu muốn trừ nợ, phải gọi API Pay Debt).

### 16. Best Practice
- Dùng Modal xác nhận cảnh báo trước khi FE gọi hàm này, vì API này chọc thẳng vào DB bỏ qua nghiệp vụ tài chính.

---

## 5. GET `/api/v1/admin/exports/orders-today`

### 1. Tổng quan
- **Tên API**: Xuất Excel đơn hàng hôm nay
- **Method**: `GET`
- **Permission**: Admin

### 2. Mục đích
- Phục vụ bộ phận kho và kế toán tải file thống kê các đơn phát sinh trong ngày để đối chiếu.

### 7. Response
- Trả về stream file Excel (.xlsx).
- **Frontend Note**: Khi dùng Axios gọi API này, phải set `responseType: 'blob'` thì mới download và save file thành công. Tên file được sinh tự động.
