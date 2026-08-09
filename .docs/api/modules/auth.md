# Authentication Module

Module này cung cấp các API để xác thực người dùng (đăng nhập, làm mới token, lấy thông tin cá nhân).

## 1. Đăng nhập (Login)

- **Module**: Auth
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Rate Limit**: `authThrottle` (5 req / 1 min)
- **Authentication**: Public API
- **Mục đích**: Đăng nhập bằng số điện thoại và mật khẩu. Hệ thống trả về `accessToken` (thời hạn 1 giờ) và `refreshToken` (thời hạn 1 ngày, hoặc 30 ngày nếu chọn `rememberMe`).

### Request Header (Tuỳ chọn)
- `X-Client-Type`: Truyền `WEB` hoặc `APP`. Mặc định là `APP`. Nếu là `WEB`, Backend sẽ tự động gắn HttpOnly Cookie để chống XSS.

### Request Body

| Field | Type | Required | Description | Validation Rule |
| --- | --- | --- | --- | --- |
| `phoneNumber` | string | Có | Số điện thoại | Phải đúng định dạng mobile. |
| `password` | string | Có | Mật khẩu | Tối thiểu 6 ký tự |
| `rememberMe` | boolean | Không | Ghi nhớ đăng nhập | Tùy chọn |

### Business Flow
1. Validate payload.
2. Tìm user theo `phoneNumber`. Báo lỗi 400 nếu không tìm thấy.
3. Verify password hash. Báo lỗi 400 nếu sai.
4. Mở Database Transaction.
5. Tạo `accessToken` qua `User.accessTokens.create`.
6. Lưu `refreshToken` vào DB (bảng `refresh_tokens`).
7. Commit transaction.

### Response

**Trường hợp 1: APP (`X-Client-Type: APP` - Mặc định)**
**200 OK**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "oat_...",
    "refreshToken": "random_string_64_chars",
    "user": { ... }
  }
}
```

**Trường hợp 2: WEB Admin (`X-Client-Type: WEB`)**
- Kèm theo HTTP Header: `Set-Cookie: accessToken=oat_...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
**200 OK**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... }
  }
}
```
*(Token không nằm trong JSON body để chống XSS)*

---

## 2. Làm mới Token (Refresh)

- **Module**: Auth
- **URL**: `/api/v1/auth/refresh`
- **Method**: `POST`
- **Rate Limit**: `authThrottle` (5 req / 1 min)
- **Authentication**: Public API
- **Mục đích**: Khi `accessToken` hết hạn, sử dụng `refreshToken` để xin cấp lại một `accessToken` mới (hạn 1 giờ).

### Request Body

| Field | Type | Required | Description | Validation Rule |
| --- | --- | --- | --- | --- |
| `refreshToken` | string | Có | Refresh Token đã cấp | Phải là chuỗi |

### Business Flow
1. Lấy record từ `refresh_tokens` theo token truyền lên.
2. Ném Exception 401 nếu: Không tìm thấy, đã bị thu hồi (`isRevoked`), hoặc đã hết hạn (`expiresAt`).
3. Truy vấn User liên kết.
4. Tạo và trả về `accessToken` mới.

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "oat_new..."
  }
}
```

---

## 3. Lấy thông tin tài khoản (Me)

- **Module**: Auth
- **URL**: `/api/v1/auth/me`
- **Method**: `GET`
- **Authentication**: `Bearer Token` (yêu cầu login hợp lệ qua middleware `auth`).
- **Mục đích**: Lấy thông tin chi tiết (kèm theo profile) của User đang đăng nhập.

### Business Flow
1. Lấy `user` hiện tại từ HTTP Context (được inject bởi Auth Middleware).
2. Tải thêm relation `profile` bằng `.load()`.
3. Format dữ liệu trả về theo DTO chuẩn (ID, tên, số điện thoại, role, profile...).

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "profile": {
      "avatarUrl": "...",
      "storeName": "Cửa hàng A",
      "currentDebt": 100000,
      "debtLimit": 5000000,
      "zaloUserId": "..."
    }
  }
}
```
*(Trường `profile` có thể `null` nếu user chưa thiết lập hồ sơ)*.

---

## 4. Cập nhật hồ sơ (Update Profile)

- **Module**: Auth
- **URL**: `/api/v1/auth/me`
- **Method**: `PUT`
- **Authentication**: `Bearer Token`
- **Mục đích**: User đang đăng nhập cập nhật thông tin cá nhân.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fullName` | string | Có | Họ tên mới |
| `avatarUrl` | string | Không | Link ảnh đại diện mới |

### Response
**200 OK**
Trả về data tương tự như GET `/api/v1/auth/me`.

---

## 5. Quên mật khẩu (Forgot Password)

- **Module**: Auth
- **URL**: `/api/v1/auth/forgot-password`
- **Method**: `POST`
- **Rate Limit**: `authThrottle`
- **Authentication**: Public API
- **Mục đích**: Gửi mã xác thực (OTP) đến số điện thoại để khôi phục mật khẩu.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phoneNumber` | string | Có | Số điện thoại đăng ký |

### Response
**200 OK**
```json
{
  "success": true,
  "message": "Nếu số điện thoại tồn tại, mã OTP đã được gửi",
  "otp": "123456" // (Chỉ hiển thị trong môi trường DEV)
}
```

---

## 6. Khôi phục mật khẩu (Reset Password)

- **Module**: Auth
- **URL**: `/api/v1/auth/reset-password`
- **Method**: `POST`
- **Rate Limit**: `authThrottle`
- **Authentication**: Public API
- **Mục đích**: Cập nhật mật khẩu mới bằng mã OTP.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phoneNumber` | string | Có | Số điện thoại |
| `token` | string | Có | Mã OTP đã nhận được |
| `newPassword` | string | Có | Mật khẩu mới (tối thiểu 6 ký tự) |

### Response
**200 OK**
```json
{
  "success": true,
  "message": "Khôi phục mật khẩu thành công"
}
```

---

## 7. Đổi mật khẩu (Change Password)

- **Module**: Auth
- **URL**: `/api/v1/auth/change-password`
- **Method**: `PUT`
- **Authentication**: `Bearer Token`
- **Mục đích**: Dành cho user đang đăng nhập đổi sang mật khẩu mới.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `oldPassword` | string | Có | Mật khẩu hiện tại |
| `newPassword` | string | Có | Mật khẩu mới (tối thiểu 6 ký tự) |

### Response
**200 OK**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```
