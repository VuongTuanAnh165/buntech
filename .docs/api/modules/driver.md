# Driver Module

Module phục vụ cho App Tài xế Giao hàng (Driver App).
Tất cả các API trong module này yêu cầu quyền `DRIVER` (`Bearer Token`).

---

## 1. Đăng ký Device Token để nhận Push Notification

- **URL**: `POST /api/v1/driver/device-tokens`
- **Mục đích**: Lưu `deviceToken` (FCM/APNS) của điện thoại tài xế để hệ thống Backend có thể push thông báo (VD: "Bạn được phân công giao 1 đơn mới").
- **Request Body (JSON)**:
  - `fcmToken` (String, required, max 255): Mã token sinh ra từ Firebase/APNS.
  - `deviceType` (String, required, max 50): Ví dụ: `ANDROID`, `IOS`, `WEB`...
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Đăng ký device token thành công"
}
```

---

## 2. Lấy lộ trình giao hàng hôm nay (Today Routes)

- **URL**: `GET /api/v1/driver/routes/today`
- **Mục đích**: Lấy danh sách toàn bộ các đơn hàng cần giao **trong ngày** của tài xế đang đăng nhập (`auth.user.id`).
- **Logic**: Backend tự động lọc danh sách đơn hàng có `driver_id = auth.user.id`, trạng thái là `SHIPPING` hoặc chờ giao, sắp xếp theo thứ tự `routeOrder` đã được phân công từ trước (xem phần `batchAssign` của Admin).
- **Response (200 OK)**:
Trả về mảng (danh sách) các đơn hàng và thông tin khách hàng, số điện thoại, địa chỉ nhận hàng, tổng tiền cần thu hộ (COD).

---

## 3. Chốt giao hàng thành công (Deliver Order)

- **URL**: `PATCH /api/v1/driver/orders/:id/deliver`
- **Path Params**: `id` - ID Đơn hàng
- **Mục đích**: Tài xế bấm "Giao thành công" trên app.
- **Request Body**:
  - `idempotencyKey` (String): Mã UUID sinh từ phía App. Dùng để chống lỗi "Double Click" (Tài xế bấm nhiều lần do lag mạng).
  - Có thể chứa `amountCollected` (Số tiền thực tế tài xế thu của khách - Tùy validator cấu hình).
- **Business Flow (Luồng xử lý CỰC KỲ QUAN TRỌNG)**:
  1. Kiểm tra đơn hàng có đúng thuộc về Tài xế này không.
  2. Bắt đầu Database Transaction.
  3. Cập nhật trạng thái đơn hàng thành `DELIVERED`.
  4. Nếu có thu hộ tiền -> Tự động tính toán và tạo Record Kế toán (Transactions).
  5. Cập nhật **Công nợ (Debt)** của Khách hàng vào bảng profile.
  6. Lưu `idempotencyKey` để chống trùng.
  7. Commit Transaction.
