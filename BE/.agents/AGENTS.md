# Buntech BE - Hướng dẫn Lập trình AdonisJS 7 Enterprise (Dành cho AI & Lập trình viên)

Tài liệu này chứa các quy tắc code nghiêm ngặt và tiêu chuẩn kiến trúc cho dự án Backend AdonisJS Enterprise.
Tất cả các AI Agents (Antigravity, Cursor, Cline, Claude, v.v.) và Lập trình viên **BẮT BUỘC** phải tuân thủ các quy tắc này để đảm bảo API luôn bảo mật, tối ưu hiệu năng, dễ bảo trì và đúng chuẩn AdonisJS v7 (ESM, TypeScript).

---

## 🛑 QUY TẮC TỐI THƯỢNG CHO AI (AI RULES - ALWAYS DO THIS)

Khi sinh code cho Backend, AI **LUÔN LUÔN** phải nhớ:

- **Phiên bản AdonisJS 7 (ESM & TypeScript):** Tuyệt đối không dùng CommonJS (`require`). Luôn sử dụng ES Modules (`import`/`export`). Đảm bảo tương thích Node.js 24+.
- **Dependency Injection (IoC Container):** CẤM sử dụng các `static method` trong Service. Bắt buộc dùng `@inject()` để tiêm dependencies.
- **Tuân thủ chuẩn RESTful API & HTTP Codes:** Trả về đúng HTTP Status Code (200, 201, 400, 401, 403, 404, 422, 500).
- **Mọi truy vấn đều qua Lucid ORM:** Ưu tiên Lucid ORM. Được phép dùng Raw SQL khi ORM không tối ưu hoặc Report quá phức tạp (như WITH, CTE, WINDOW FUNCTION).
- **Tách biệt Logic (Layered Architecture):** Controller (Nhận Request/Trả Response) -> Service (Business Logic) -> Repository (Optional, dùng khi logic cực kỳ phức tạp) -> Model (Database Schema). Service tuyệt đối không được phụ thuộc ngược lại vào Controller.
- **ACID & Database Transaction:** Mọi thao tác ghi/cập nhật >= 2 bảng BẮT BUỘC phải dùng `db.transaction()`.
- **Thời gian (Date & Time):** Ưu tiên sử dụng **Luxon** cho xử lý timezone, format. Tuy nhiên với các tác vụ đo lường thời gian thực thi đơn giản có thể dùng `Date.now()` hoặc `performance.now()`.
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
- **Pagination:** BẮT BUỘC dùng `.paginate(page, limit)` của Lucid cho mọi API dạng danh sách có khả năng tăng trưởng. Với các bảng Master Data rất nhỏ (như Role, Country, Permission), có thể trả về toàn bộ nếu đã được cache.

---

## 5. Xóa Mềm (Soft Deletes) & Bảo toàn Dữ liệu

- **Chỉ áp dụng Soft Delete với dữ liệu nghiệp vụ cần truy vết** (như User, Order, Product).
- Đối với các bảng Master Data ít thay đổi hoặc mang tính tham chiếu (như Role, Country, Province), KHÔNG cần dùng Soft Delete để tránh dư thừa và phức tạp hệ thống.

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
- **Rác ổ cứng (Storage Leak):** Khi Update một bản ghi có kèm theo upload file mới, BẮT BUỘC phải viết logic tìm và xóa file vật lý cũ (nếu có) trước khi lưu file mới.

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

---

## 16. Performance & Scalability (CỰC KỲ QUAN TRỌNG ĐỐI VỚI AI)

Đây là nhóm quy tắc then chốt để đảm bảo hệ thống Backend có thể phục vụ khối lượng lớn traffic. AI **bắt buộc** phải rà soát mã nguồn theo các tiêu chí này:

1. **Không `SELECT *`**: Luôn select đúng những cột cần dùng (VD: `.select('id', 'name')`).
2. **Không query toàn bộ bảng**: Nghiêm cấm query toàn bộ bảng (như `User.all()`) nếu bảng có lượng dữ liệu lớn. Mọi API list phải có paginate hoặc limit.
3. **Giới hạn Limit**: Giới hạn tối đa luôn phải `<= 100` để tránh bị OOM (Out of Memory).
4. **Tránh N+1 Query**: Tuyệt đối không query cơ sở dữ liệu trong vòng lặp.
5. **Không Preload vô tội vạ**: Chỉ preload các quan hệ nếu response thực sự cần sử dụng đến. Tránh load dữ liệu rác.
6. **Cursor Pagination**: Chỉ sử dụng Cursor Pagination thay vì Offset cho các bảng dữ liệu cực lớn (hàng triệu bản ghi), Realtime Feed, hoặc Infinite Scroll. Với 90% trường hợp doanh nghiệp thông thường, Offset Pagination vẫn là lựa chọn tốt.
7. **Cache dữ liệu tĩnh**: Tích cực dùng Cache cho các Master Data (như Country, Category, Permission) để không hit DB mỗi request.
8. **Bulk Operations & Chunking**: Dùng `createMany` / `updateMany` khi thao tác hàng loạt. ĐẶC BIỆT chú ý với dữ liệu khổng lồ (VD: 100,000 records) thì phải chia nhỏ (chunk) thành từng đợt (ví dụ 1000 records/lần) để tránh tràn RAM.
9. **Xử lý Async độc lập**: Chỉ ưu tiên dùng `Promise.all` cho các tác vụ IO **hoàn toàn không phụ thuộc lẫn nhau**. Cấm dùng Promise.all nếu tác vụ sau cần ID của tác vụ trước (VD: `createOrder` và `createOrderDetail`).
10. **Data Streaming & Memory Leak**: Tuyệt đối không giữ các Object khổng lồ trong RAM. Không load toàn bộ dữ liệu vào RAM khi export Excel/CSV, bắt buộc dùng Stream hoặc Chunk.
11. **File I/O**: Không dùng các hàm đọc/ghi đồng bộ như `readFileSync` gây block main thread.
12. **Không Business Logic trong Model**: Model chỉ chứa relations, scope, và hook. Tuyệt đối không nhét logic vào Model (VD: `User.createOrder()`).
13. **Magic Numbers & Config**: Cấm dùng hardcode (như `if (status == 7)` hay `const LIMIT = 100`). Phải đọc từ `env`, `config`, hoặc `Enum`.
14. **Index Database**: Khi viết Migration, luôn phải thiết lập index (`table.index()`) cho các Foreign Keys và các cột dùng để tìm kiếm/lọc.
15. **Query Complexity & N+1**: Không `.preload()` quá sâu (từ 3-4 tầng quan hệ) gây phình to câu query. AI rất hay mắc lỗi này.
16. **Transaction Duration & Lock**: Transaction phải càng ngắn càng tốt. CẤM các tác vụ chậm (Upload S3, Gửi Mail, gọi External API) nằm bên trong `db.transaction()` để tránh giam lock DB. Không dùng `FOR UPDATE` nếu không thực sự cần thiết.
17. **Idempotency**: Các API nhạy cảm (Thanh toán, Đặt hàng, Webhook) bắt buộc phải thiết kế theo chuẩn Idempotent (gọi nhiều lần không sinh ra dữ liệu trùng lặp).
18. **Retry & Timeout**: Mọi lời gọi tới External API (axios) hoặc Queue, Mail bắt buộc phải set `timeout` (VD: 5s, không để vô hạn) và cấu hình cơ chế `Retry` tự động khi fail.
19. **API Contract & Serialization**: Dữ liệu trả về (Response) phải tuân thủ nghiêm ngặt chuẩn định dạng FE yêu cầu (success, message, data, meta). Tuyệt đối không để rò rỉ dữ liệu nhạy cảm (`password`, `deleted_at`, `remember_token`) ra ngoài response.

---

## 17. DRY (Don't Repeat Yourself) & Code Reusability (CỰC KỲ QUAN TRỌNG ĐỐI VỚI AI)

- **Nguyên tắc cho AI & Lập trình viên:** Tuyệt đối không sinh ra code trùng lặp (Duplicate Code), copy-paste logic hoặc tạo nhiều class/file có cùng chức năng chỉ khác một vài dòng code.
- **Trước khi tạo mới** bất kỳ Controller, Service, Repository, Validator, Middleware, Policy... AI **BẮT BUỘC** phải kiểm tra trong dự án xem đã có module tương tự hay chưa.
- Khi phát triển chức năng mới có nghiệp vụ tương tự:
  - Ưu tiên **mở rộng (Extend)** hoặc **tái sử dụng (Reuse)** module hiện có.
  - Nếu chỉ khác một vài tham số hoặc hành vi nhỏ, hãy truyền thêm **Options, Config, Enum** thay vì tạo class/file mới.
  - Chỉ tạo class/module mới khi nghiệp vụ thực sự khác biệt.
- **Không được Over-Abstraction:** Không tạo `BaseService`, `BaseRepository`... nếu chưa có nhu cầu tái sử dụng rõ ràng. Chỉ trừu tượng hóa khi có từ **2–3 nơi** thực sự sử dụng chung (Rule of Three).
- **Ví dụ đúng:** Yêu cầu Admin tạo User -> Thêm `UserService.create(data, { isAdmin: true })`.
- **Ví dụ sai:** Tạo riêng `AdminUserService.create(data)` copy y hệt `UserService`.

---

## 18. Không Phá Vỡ Kiến Trúc Hiện Có (Respect Existing Architecture)

- **AI không được tự ý thay đổi kiến trúc, cấu trúc thư mục, naming convention hoặc coding pattern của dự án khi chưa có yêu cầu rõ ràng.**
- Khi bổ sung tính năng mới, phải **tuân thủ đúng pattern đang được sử dụng** trong dự án.
- Không tự ý thay thế một cách triển khai đang ổn định bằng pattern khác (ví dụ chuyển từ Service sang CQRS, từ Event sang Observer) chỉ vì "đó là best practice".
- **Ưu tiên tính nhất quán (Consistency)** của toàn bộ codebase.

---

## 19. API Design Standards

- Dùng đúng **HTTP Methods**: `GET` (đọc), `POST` (tạo), `PUT` (cập nhật toàn bộ), `PATCH` (cập nhật một phần), `DELETE` (xóa).
- URL phải là danh từ số nhiều (VD: `/api/v1/users`).
- **Query Params chuẩn mực**: Các thao tác Filter, Sort, Search phải truyền qua query string (VD: `?sort=created_at&order=desc&search=abc`).

---

## 20. Database Design

- Luôn khai báo **Foreign Key** rõ ràng khi thiết kế Migration.
- Định nghĩa chuẩn các cột timestamp: `created_at`, `updated_at`, và `deleted_at` (với các bảng có soft delete).
- Đặt tên bảng, tên cột theo chuẩn `snake_case`.

---

## 21. Security (Bảo mật)

- Luôn kiểm soát **Mass Assignment**: Không nhét mù quáng toàn bộ `request.all()` vào hàm `create()`.
- Chống **SQL Injection**: Lucid ORM đã lo, nhưng cấm tuyệt đối nối chuỗi thẳng vào `Raw SQL`.
- File Upload: Bắt buộc kiểm tra kỹ MIME type, dung lượng tối đa và đổi tên file ngẫu nhiên để chống Path Traversal.

---

## 22. AI Self Checklist ⭐⭐⭐⭐⭐

Trước khi kết thúc bất kỳ lượt sinh code nào, **BẢN THÂN AI PHẢI TỰ RÀ SOÁT** danh sách sau:

- [ ] Có phá vỡ cấu trúc hoặc tự ý đẻ thêm pattern mới ngoài quy định không? (Respect Architecture)
- [ ] Code có bị trùng lặp không? Có thể tái sử dụng Service/Validator có sẵn không? (DRY)
- [ ] Có dùng Dependency Injection (`@inject`) thay vì gọi static hay `new` chưa?
- [ ] Dữ liệu đầu vào đã được Validate bằng VineJS chưa?
- [ ] Có Transaction nếu ghi từ 2 bảng trở lên chưa? Transaction có bị kẹp các tác vụ chậm (Gửi Mail/Upload) không?
- [ ] List API đã được paginate chưa?
- [ ] Câu query đã select đúng các cột cần thiết chưa?
- [ ] Có lỗi N+1 Query không? (Có query trong vòng lặp không?)
- [ ] Có preload quá sâu hoặc preload thừa thãi không?
- [ ] Đã dùng `logger` thay cho `console.log` chưa?
- [ ] Đã dùng `Enum` thay vì số cứng (Magic Number) chưa?
- [ ] Migration đã đánh `index()` cho khóa ngoại và cột hay tìm kiếm chưa?
- [ ] API Response trả về đã đúng cấu trúc `success, data, message` FE mong đợi chưa?
- [ ] Đã giấu đi các trường nhạy cảm (password, deleted_at) trong response chưa?
- [ ] Có để sót type `any` nào làm mất tính chặt chẽ của TypeScript không?
- [ ] Đã giới hạn `timeout` cho các call tới External API chưa?
- [ ] **Khi update có upload file mới, đã viết code tự động xóa file cũ trên ổ cứng chưa?**

---

## 23. Quy trình thiết kế & Review tính năng cho AI (AI Workflow)

Bắt đầu từ thời điểm này, tất cả các AI Agents phải áp dụng quy trình chuẩn sau khi phát triển tính năng mới để tránh sai sót và đảm bảo chất lượng code (Enterprise Ready):

1. **Thiết kế trước khi Code (Brainstorming Skill):**
   - **Tuyệt đối KHÔNG code ngay:** Khi nhận một yêu cầu tính năng mới, AI phải tự động áp dụng tư duy của skill `brainstorming`.
   - **Quy trình:** Tìm hiểu bối cảnh (Context) -> Đặt câu hỏi làm rõ (1 câu mỗi lần) -> Đề xuất 2-3 phương án (có trade-offs) -> Trình bày thiết kế chi tiết -> Chờ User phê duyệt -> Ghi tài liệu thiết kế (Design Doc).
   - Tinh thần chủ đạo: "YAGNI ruthlessly" (Loại bỏ triệt để các râu ria không cần thiết).

2. **Cross-Agent Code Review (Agentic Review Handoff Skill):**
   - **Review chéo độc lập:** Khi một tính năng được code xong hoặc User yêu cầu review lại 1 đoạn mã/Branch, AI phải sử dụng protocol `agentic-review-handoff`.
   - **Lưu trữ Artifacts (Review Packets):** Mọi phiên review, ghi nhận lỗi và re-review phải được ghi lại thành các file markdown (Append-only) trong `$repo_root/.review-handoff/active/`.
   - **Phân tách trách nhiệm (Separation of Concerns):** AI đóng vai trò Reviewer không được tự tiện sửa code (Read-only for code). Chỉ đề xuất `# Fix Handoff` để Implementer sửa. Việc sửa code chỉ xảy ra khi User ra lệnh `fix it`.

Điều này giúp dự án Buntech thiết lập quy trình làm việc chuyên nghiệp như một đội ngũ kỹ sư thực thụ: Thiết kế (Brainstorm) -> Lập trình (Implement) -> Đánh giá độc lập (Agentic Review).
