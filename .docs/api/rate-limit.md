# Rate Limiting (Giới hạn truy cập)

Hệ thống sử dụng package `@adonisjs/limiter` để cấu hình Rate Limit, nhằm chống DDoS và Brute-force, định nghĩa tại `start/limiter.ts`.

## Các cấu hình Limiter

### 1. `global` Limiter
- **Limit**: 10 requests / 1 phút.
- **Áp dụng**: Có thể áp dụng trên các route public quan trọng (nếu có gắn).

### 2. `auth` Limiter (`authThrottle`)
- **Limit**: 5 requests / 1 phút.
- **Áp dụng**:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
- **Mục đích**: Chống Brute-force mật khẩu hoặc refresh token rác liên tục.

### 3. `quick_order` Limiter (`quickOrderThrottle`)
- **Limit**: 3 requests / 1 phút.
- **Áp dụng**: 
  - `POST /api/v1/orders/quick`
- **Mục đích**: Chống tình trạng spam tạo đơn hàng nhanh (không cần đăng nhập) gây rác hệ thống hoặc phá rối.

## Trả về khi vượt Limit
Khi một Client (IP) vượt quá số lượng request cho phép, hệ thống sẽ chặn và trả về HTTP Status Code `429 Too Many Requests`.
