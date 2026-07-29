# Authentication (Xác thực)

Hệ thống Buntech Backend sử dụng **Opaque Access Tokens** thông qua package `@adonisjs/auth/access_tokens`.

## Cơ chế hoạt động

1. Client gọi API `POST /api/v1/auth/login` với thông tin đăng nhập.
2. Server xác thực thành công, sinh ra Access Token và trả về cho Client.
3. Client lưu trữ token và gửi kèm trong Header `Authorization` cho các API yêu cầu xác thực.

## Cách truyền Token

Trong mọi request gửi lên các API yêu cầu xác thực, phải kèm theo HTTP Header:

```http
Authorization: Bearer <your_access_token>
```

## Middleware

- `middleware.auth()`: Đảm bảo request phải có token hợp lệ. Nếu không có hoặc token hết hạn/sai, hệ thống tự động trả về lỗi `HTTP 401 Unauthorized`.
- `middleware.silentAuth()`: Cố gắng xác thực người dùng nếu có token, nhưng KHÔNG throw lỗi `401` nếu token không hợp lệ hoặc bị thiếu. Dùng cho các route Public nhưng có thể hiển thị dữ liệu tuỳ chọn (ví dụ: giỏ hàng, thông tin cá nhân trên trang chủ).

## Hết hạn Token (Expiration)

Token có thời hạn sống nhất định (theo cấu hình của hệ thống, thường do Service cấp lúc login).
Khi Access Token hết hạn, client cần gọi API `POST /api/v1/auth/refresh` (nếu hệ thống hỗ trợ refresh token) hoặc yêu cầu user login lại.
