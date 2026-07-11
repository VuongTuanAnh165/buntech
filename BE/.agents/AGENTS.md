# Buntech BE - Hướng dẫn Lập trình AdonisJS 7 Enterprise (Dành cho AI & Lập trình viên)

Tài liệu này chứa các quy tắc code nghiêm ngặt và tiêu chuẩn kiến trúc cho dự án Backend AdonisJS Enterprise.
Tất cả các AI Agents (Antigravity, Cursor, Cline, Claude, v.v.) và Lập trình viên **BẮT BUỘC** phải tuân thủ các quy tắc này để đảm bảo API luôn bảo mật, tối ưu hiệu năng, dễ bảo trì và đúng chuẩn AdonisJS v7 (ESM, TypeScript).

---

## 🛑 QUY TẮC TỐI THƯỢNG CHO AI (AI RULES - ALWAYS DO THIS)

Khi sinh code cho Backend, AI **LUÔN LUÔN** phải nhớ:

- **Phiên bản AdonisJS 7 (ESM & TypeScript):** Tuyệt đối không dùng CommonJS (`require`). Luôn sử dụng ES Modules (`import`/`export`). Đảm bảo tương thích Node.js 24+.
- **Dependency Injection (IoC Container):** CẤM sử dụng các `static method` trong Service. Bắt buộc dùng `@inject()` để tiêm dependencies.
- **Tuân thủ chuẩn RESTful API & HTTP Codes:** Trả về đúng HTTP Status Code (200, 201, 400, 401, 403, 404, 422, 500).
- **Mọi truy vấn đều qua Lucid ORM:** Tuyệt đối không viết raw SQL trừ khi là Report siêu phức tạp.
- **Tách biệt Logic (Layered Architecture):** Controller (Nhận Request/Trả Response) -> Service (Business Logic) -> Model (Database Schema).
- **ACID & Database Transaction:** Mọi thao tác ghi/cập nhật >= 2 bảng BẮT BUỘC phải dùng `db.transaction()`.
- **Thời gian (Date & Time):** Bắt buộc sử dụng **Luxon** cho mọi xử lý thời gian. Cấm dùng `moment`, `date-fns` hay `Date` thuần.
- **Logging thay vì Console:** Tuyệt đối KHÔNG dùng `console.log()` trong code production. Hãy dùng `logger.info()`, `logger.error()`.

---

## 1. Quy tắc Đặt tên & Cấu trúc File (Naming Conventions)

- **Controllers:** `PascalCase` với hậu tố `Controller` (VD: `UsersController`). File: `snake_case` (VD: `users_controller.ts`).
- **Models:** `PascalCase`, số ít (VD: `User`, `Order`). File: `user.ts`.
- **Services:** `PascalCase` với hậu tố `Service` (VD: `OrderService`). File: `order_service.ts`.
- **Middleware:** `PascalCase` với hậu tố `Middleware`. File: `auth_middleware.ts`.
- **Validators:** `snake_case` (VD: `create_user_validator.ts`).
- **Exceptions:** `PascalCase` với hậu tố `Exception`.
- **Events/Listeners:** `PascalCase` (VD: `OrderCreated`).

---

## 2. Kiến trúc 3 Lớp & Dependency Injection

Áp dụng chặt chẽ IoC Container để Decouple code. Cấm tạo instance bằng `new Service()`.

```ts title="app/controllers/orders_controller.ts"
import { inject } from '@adonisjs/core'
import OrderService from '#services/order_service'

@inject()
export default class OrdersController {
  constructor(protected orderService: OrderService) {}
}
```

---

## 3. Validation & DTO với VineJS

- Sử dụng **VineJS** để validate. Lỗi tự động throw `HTTP 422`.
- Tận dụng khả năng Transform của VineJS (parse số, parse luxon date) ngay trong schema để chuẩn hóa data (DTO) trước khi vào Controller.

---

## 4. Database, Lucid ORM & Pagination

- **Tránh N+1 Query:** Luôn dùng `.preload()` hoặc `.aggregate()`.
- **Pagination:** BẮT BUỘC dùng `.paginate(page, limit)` của Lucid cho mọi API dạng danh sách.

---

## 5. Xóa Mềm (Soft Deletes) & Bảo toàn Dữ liệu

- Đối với các thực thể quan trọng (User, Order, Product): **CẤM** sử dụng hàm `.delete()` thuần túy.
- Bắt buộc phải implement **Soft Deletes** (thêm cột `deleted_at`). Khi xóa chỉ cập nhật timestamp để còn truy vết.

---

## 6. Kiến trúc Hướng Sự kiện (Event-Driven Architecture)

- Tuyệt đối không nhét logic phụ (như Gửi Email, Bắn Zalo, Tạo Noti) chen ngang vào Service chính gây thắt cổ chai (Spaghetti Code).
- Dùng `@adonisjs/core/events` để phát sự kiện. Các Listener sẽ tự tách ra xử lý riêng biệt.
  `emitter.emit('order:created', order)`

---

## 7. Xử lý Tác vụ Nền (Background Jobs & Queues)

- Cấm block main thread (HTTP request) cho tác vụ tốn thời gian (> 1 giây).
- Các tác vụ như Export Excel, Gửi mail hàng loạt phải được đưa vào **Message Queue** (VD: BullMQ).

---

## 8. Quản lý File Upload (Adonis Drive)

- Tuyệt đối không dùng module `fs` thuần để lưu file.
- Bắt buộc sử dụng `@adonisjs/drive` (Abstraction Layer) để dễ dàng migrate dữ liệu từ Local sang Cloud (S3/GCS) lúc Production. Mọi file phải được validate `vine.file()`.

---

## 9. Exception Handling (Xử lý lỗi Toàn cục)

- Thay vì rải `try/catch` khắp nơi, hãy tạo Custom Exceptions (bằng lệnh `make:exception`) và gom về `app/exceptions/handler.ts` để format trả JSON một chuẩn duy nhất.

---

## 10. Ghi log Chuyên nghiệp (Logging & Observability)

- Không dùng `console.log`. Bắt buộc dùng `@adonisjs/core/services/logger` (nhân Pino).
- Log lỗi Production phải đính kèm context (Mã lỗi, UserID, RequestID).

---

## 11. Biến môi trường (Environment Variables)

- Không gọi `process.env.VAR` trực tiếp.
- Phải validate bằng VineJS trong `start/env.ts` và truy xuất qua `import env from '#start/env'`.

---

## 12. Security (CORS, Rate Limiting & Bouncer)

- Áp dụng **Rate Limiting** để chống DDoS/Brute-force trên các API nhạy cảm.
- Phân quyền dùng **Bouncer Policies**, tuyệt đối không code `if (user.role === 'admin')` cứng trong Controller.

---

## 13. Caching (Redis)

- Với các API tĩnh, đọc nhiều (VD: Danh sách chi nhánh), tích hợp `@adonisjs/redis` hoặc `@adonisjs/cache` để cache Query, giảm tải DB.

---

## 14. Kiểm thử (Testing với Japa & Lucid Factories)

- Viết Unit/Functional Test bằng **Japa**.
- Dùng **Lucid Factories** để sinh Dummy Data.
- Lợi dụng Dependency Injection (`@inject`) để Mock external services lúc test.

---

## 15. Clean Code & Typings

- Phải handle dứt điểm null/undefined bằng TypeScript (dùng `findOrFail()`, Optional Chaining).
- Chạy `npm run format` và `typecheck` trước khi commit, không để cảnh báo `any`.
