# Yêu cầu bổ sung API Backend - Phase 3 (Đợt 3)

Tài liệu này tổng hợp các API mà Backend **cần phải bổ sung khẩn cấp** để Frontend có thể hoàn thiện tính năng ở Sprint 4 (App Tài Xế) và Sprint 6 (Customer Portal) mà không bị block.

---

## 1. Module Customer Portal (Khách sỉ)

Khách sỉ (role `CUSTOMER`) đăng nhập vào Portal để tự xem công nợ, xem lịch sử đơn và tự đặt hàng mới. 
Hiện tại Backend chưa có các API dành riêng cho role này.

### 1.1. Lấy Công nợ hiện tại
- **Endpoint**: `GET /api/v1/customer/debt`
- **Auth**: Yêu cầu token hợp lệ (Role `CUSTOMER` hoặc `ADMIN`).
- **Mô tả**: Dựa vào `auth.user.id`, Backend tự động tính toán tổng công nợ chưa thanh toán.
- **Response**:
```json
{
  "success": true,
  "message": "Lấy thông tin công nợ thành công",
  "data": {
    "currentDebt": 15500000,
    "debtLimit": 50000000,
    "currency": "VND",
    "updatedAt": "2026-08-09T10:00:00Z"
  }
}
```

### 1.2. Danh sách Đơn hàng cá nhân
- **Endpoint**: `GET /api/v1/customer/orders`
- **Auth**: Yêu cầu token hợp lệ (Role `CUSTOMER`).
- **Query Params**:
  - `page`, `limit` (Chuẩn phân trang).
  - `status` (Lọc theo trạng thái đơn hàng).
- **Mô tả**: Trả về danh sách lịch sử đơn hàng do chính User này đặt hoặc được Admin tạo cho User này (`userId` = `auth.user.id`).

### 1.3. Chi tiết Đơn hàng cá nhân
- **Endpoint**: `GET /api/v1/customer/orders/:id`
- **Auth**: Yêu cầu token hợp lệ (Role `CUSTOMER`).
- **Mô tả**: Xem chi tiết đơn hàng (các mặt hàng, số lượng, giá tiền). Backend bắt buộc kiểm tra xem đơn hàng này có thuộc sở hữu của `auth.user.id` không, nếu không trả 403 Forbidden.

### 1.4. Tự Đặt Hàng (Khách sỉ)
- **Endpoint**: `POST /api/v1/customer/orders`
- **Auth**: Yêu cầu token hợp lệ (Role `CUSTOMER`).
- **Mô tả**: Khách sỉ tự đặt hàng qua form. Backend tự lấy `userId` từ token, và tự động tham chiếu bảng giá ưu đãi (Custom Price) của User đó để ra tổng tiền giống logic AdminOrdersController đang làm.
- **Request Body**:
```json
{
  "items": [
    { "productId": 1, "quantity": 50 },
    { "productId": 2, "quantity": 10 }
  ],
  "note": "Giao sáng sớm giúp em nhé"
}
```

---

## 2. Module Driver App (Tài xế)

App Tài Xế (role `DRIVER`) thiếu tính năng tra cứu lịch sử và nhận chuông thông báo.

### 2.1. Xem Lịch sử Giao hàng
- **Endpoint**: `GET /api/v1/driver/history`
- **Auth**: Yêu cầu token hợp lệ (Role `DRIVER`).
- **Query Params**:
  - `page`, `limit` (Phân trang với `useInfinitePagination` của FE).
  - `startDate`, `endDate` (Bộ lọc ngày).
- **Mô tả**: Lấy danh sách các đơn hàng đã được giao thành công (Status = `DELIVERED`) bởi chính tài xế này (`driverId` = `auth.user.id`).

### 2.2. Danh sách Thông báo cá nhân
- **Endpoint**: `GET /api/v1/driver/notifications`
- **Auth**: Yêu cầu token hợp lệ (Role `DRIVER`).
- **Yêu cầu Database**: Backend cần thiết kế thêm bảng `notifications` (id, user_id, type, title, body, is_read, created_at).
- **Query Params**: `page`, `limit`, `unreadOnly` (boolean).
- **Mô tả**: Trả về danh sách thông báo gửi riêng cho Tài xế (ví dụ: "Có đơn hàng mới phân công cho bạn", "Đã chốt đơn #1002 thành công").
- **Ghi chú thêm**: Cần có API `PATCH /api/v1/driver/notifications/:id/read` để đánh dấu đã đọc.
