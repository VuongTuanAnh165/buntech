# Customer Portal Module (Wholesale Portal)

Module này chứa các API dành riêng cho **Khách hàng (Khách sỉ)** khi họ đăng nhập vào hệ thống để tự quản lý công nợ, theo dõi đơn hàng và tự đặt hàng.

Tất cả các API trong module này yêu cầu quyền `CUSTOMER` (`Bearer Token`).

---

## 1. Xem Công nợ Cá nhân (My Debt)

- **URL**: `GET /api/v1/customer/debt`
- **Mục đích**: Lấy thông tin công nợ hiện tại của khách hàng.
- **Logic Backend**: Backend tự động lấy `userId` từ token đang đăng nhập (`auth.user.id`) và query trường `debt` trong bảng `users` (hoặc `profiles`).
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy thông tin công nợ thành công",
  "data": {
    "currentDebt": 15000000,
    "debtLimit": 50000000,
    "currency": "VND",
    "updatedAt": "2026-08-09T10:00:00Z"
  }
}
```

---

## 2. Lấy Danh sách Đơn hàng Cá nhân (My Orders)

- **URL**: `GET /api/v1/customer/orders`
- **Mục đích**: Lấy danh sách lịch sử đặt hàng của khách hàng.
- **Query Params**:
  - `page` (Number, default 1)
  - `limit` (Number, default 10)
  - `status` (String, optional): Lọc theo trạng thái (Ví dụ: `PENDING`, `DELIVERED`).
- **Logic Backend**: Tự động lọc `WHERE user_id = auth.user.id`.
- **Response (200 OK)**: Trả về danh sách đơn hàng có phân trang.

---

## 3. Lấy Chi tiết Đơn hàng Cá nhân (My Order Detail)

- **URL**: `GET /api/v1/customer/orders/:id`
- **Path Params**: `id` - ID của đơn hàng.
- **Mục đích**: Xem chi tiết các sản phẩm trong 1 đơn hàng cụ thể.
- **Logic Backend**: Tự động kiểm tra quyền sở hữu (`order.user_id == auth.user.id`). Nếu không đúng, trả về lỗi `403 Forbidden`.
- **Response (200 OK)**: Trả về chi tiết đơn hàng kèm danh sách Items.

---

## 4. Tự Đặt hàng Sỉ (Create Wholesale Order)

- **URL**: `POST /api/v1/customer/orders`
- **Mục đích**: Khách sỉ tự điền form đặt hàng trên Portal.
- **Request Body (JSON)**:
  - `shippingAddressId` (Number, required): ID địa chỉ giao hàng của khách.
  - `note` (String, optional)
  - `deliveryDate` (Date, optional)
  - `items` (Array of Object `[{ productId, quantity }]`, required, min 1 item)
- **Business Flow (Luồng xử lý CỰC KỲ QUAN TRỌNG)**:
  1. Backend **KHÔNG** nhận `userId` từ request body mà tự động lấy `userId` từ token (`auth.user.id`) để đảm bảo bảo mật.
  2. Backend tự động quét và áp dụng **Bảng giá riêng (CustomerPrice)** của khách hàng này. Nếu không có giá riêng thì lấy giá gốc của sản phẩm.
  3. Tính toán tổng tiền, VAT, tạo đơn hàng trong Database với trạng thái `PENDING` (Chờ duyệt).
  4. Gửi thông báo (Zalo ZNS / Notification) cho Admin biết có đơn hàng mới từ Khách sỉ.
- **Response (201 Created)**: Trả về thông tin đơn hàng vừa được tạo.
