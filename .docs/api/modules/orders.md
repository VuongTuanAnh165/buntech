# Orders Module

Module Quản lý đơn hàng (M5), phân luồng từ Đặt hàng nhanh (Client), Quản lý chung (Admin), đến Chốt đơn giao hàng (Driver).

---

## 1. Đặt hàng nhanh (Quick Order / Lead Generation)

- **Module**: Orders
- **URL**: `POST /api/v1/orders/quick`
- **Authentication**: Public API (Không cần đăng nhập)
- **Rate Limit**: `quickOrderThrottle` (3 req/phút).
- **Mục đích**: Khách vãng lai gửi yêu cầu mua hàng. Có áp dụng `Honeypot` (field ẩn trên UI như `website_url` để lừa bot điền) nhằm chống spam.

### Request Body (JSON)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fullName` | string | Có | Tên khách (max 100) |
| `phoneNumber` | string | Có | SĐT (định dạng 10-11 số) |
| `address` | string | Có | Địa chỉ giao hàng |
| `note` | string | Không | Ghi chú |
| `website_url`| string | Không | HONEYPOT! Bot điền vào sẽ bị chặn `400 Bad Request`. |
| `items` | array | Có | Danh sách sản phẩm mua (`[{ productId, quantity }]`) |

### Business Flow
1. Check honeypot: Nếu `website_url` có dữ liệu -> Báo lỗi `400 Invalid request`.
2. Truyền vào `PublicOrderService` lưu thành đơn hàng nháp chờ sale liên hệ.
3. Trả về OrderID và Tổng tiền ước tính.

---

## 2. Quản lý Đơn hàng (Admin)

Toàn bộ API dưới đây có Prefix `/api/v1/admin/orders` và yêu cầu `Bearer Token` (Role `ADMIN`).

### 2.1 Danh sách đơn hàng
- **Method**: `GET /`
- **Query Params**: `page`, `limit`, `status`, `userId`, `driverId` (Lọc theo khách hoặc tài xế).
- **Mục đích**: Lấy danh sách phân trang tất cả đơn hàng.

### 2.2 Chi tiết đơn hàng
- **Method**: `GET /:id`
- **Mục đích**: Lấy chi tiết thông tin hóa đơn, sản phẩm, khuyến mãi...

### 2.3 Tạo đơn hàng cho khách sỉ
- **Method**: `POST /`
- **Request Body (JSON)**:
  - `userId` (Number, required, positive)
  - `shippingAddressId` (Number, required, positive)
  - `paymentMethod` (String, required, max 50) - Ví dụ: CASH, BANK_TRANSFER, DEBT
  - `amountPaid` (Number, required, min 0)
  - `deliveryNote` (String, optional)
  - `idempotencyKey` (String, required, max 100): Mã UUID sinh từ phía App. Dùng để chống lỗi "Double Click" (Tài xế bấm nhiều lần do lag mạng).
  - `items` (Array of Object `[{ productId, quantity }]`, required, min 1 item)
- **Business Flow (Luồng xử lý CỰC KỲ QUAN TRỌNG)**:
  1. Payload validator. *(Lưu ý: Đối với tính năng "Copy đơn ngày hôm qua", Frontend tự parse dữ liệu cũ và gọi chung vào API `POST` này với format JSON đầy đủ, Backend không tạo API `/clone` riêng).*
  2. Dựa vào `userId` của khách hàng, hệ thống tự động quét và áp dụng **Bảng giá riêng (CustomerPrice)** (nếu khách sỉ được thiết lập giá ưu đãi trước).
  3. Tính toán tổng tiền, VAT, tạo đơn hàng trong Database.
  4. Hệ thống (Backend) sẽ kích hoạt sự kiện ngầm chạy Background Job để gửi tin nhắn Zalo ZNS tự động thông báo đơn hàng (FE không cần xử lý trigger gửi tin nhắn).

### 2.4 Cập nhật trạng thái
- **Method**: `PATCH /:id/status`
- **Request Body (JSON)**:
  - `status` (String, required)
  - `deliveryStatus` (String, optional)
  - `paymentStatus` (String, optional)
- **Mục đích**: Đổi trạng thái đơn hàng (Ví dụ: PROCESSING -> SHIPPING).

### 2.5 Gán tài xế hàng loạt (Batch Assign)
- **Method**: `PATCH /batch-assign`
- **Request Body (JSON)**: 
  - `driverId` (Number, required, positive)
  - `orders` (Array of Object `[{ orderId, routeOrder }]`, required, min 1 item)
- **Mục đích**: Phân công và vạch lộ trình giao hàng (Routing) cho một tài xế cụ thể trong ngày.

---

## 3. Tài xế Giao hàng (Driver)

Phần này đã được chuyển sang [Driver Module](driver.md) để tránh trùng lặp.
*(Bao gồm API chốt đơn `PATCH /api/v1/driver/orders/:id/deliver`)*
