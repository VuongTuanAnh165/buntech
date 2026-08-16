# Lộ trình Triển khai Frontend (Frontend Roadmap)

**Dự án:** Chuyển đổi số Xưởng Bún BunTech
**Vai trò:** Senior Frontend Architect
**Tài liệu tham chiếu:** Thiết kế Kiến trúc (`frontend_architecture.md`), Kiến trúc Code (`frontend_code_architecture.md`)

---

## 1. Đề xuất thứ tự tối ưu để phát triển & Critical Path

Để đảm bảo dự án luôn trong trạng thái có thể chạy được (Runnable) và bàn giao từng phần (Incremental Delivery), thứ tự phát triển phải đi từ Lõi dữ liệu $\rightarrow$ Vận hành $\rightarrow$ Kết quả.

**CRITICAL PATH (Đường găng dự án):**
`Khởi tạo Boilerplate & Auth` $\rightarrow$ `Master Data & Khách hàng` $\rightarrow$ `Sản phẩm & Giá riêng` $\rightarrow$ `Tạo đơn hàng` $\rightarrow$ `Điều phối (Batch Assign)` $\rightarrow$ `Driver App (Chốt đơn)` $\rightarrow$ `Tự động hạch toán Công nợ & Kho`.

*Bất kỳ sự chậm trễ nào trên Critical Path này đều sẽ làm trễ toàn bộ thời gian release của dự án.* Các tính năng như Blog, Review, Dashboard nằm ngoài đường găng, có thể làm song song hoặc dời lại nếu cấp bách.

---

## 2. Roadmap Triển khai (Theo Sprint)

*Giả định: 1 Sprint = 2 tuần. Đội ngũ FE gồm 1-2 người.*

### SPRINT 1: Nền tảng lõi, Quản lý Khách hàng & Cấu hình
**Mục tiêu:** Setup xong dự án, đăng nhập thành công, quản lý được thông tin khách sỉ và cấu hình hệ thống cơ bản.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Core, Auth, Master Data, Users, System Configs |
| **Chức năng** | 1. **Khởi tạo:** `npx nuxi init FE`, cài đặt **ESLint + Husky** khắt khe.<br>2. Màn hình Login, **Quên mật khẩu**, **Đổi mật khẩu** và **Cập nhật Profile**.<br>3. Layout Admin (Sidebar, Header).<br>4. Lấy Master Data (Tỉnh thành, Enum) có ETag.<br>5. **Quản lý Cấu hình hệ thống** (Phí ship, thông tin liên hệ...).<br>6. Quản lý Khách hàng & **Sổ địa chỉ** (List ảo hóa với `vue-virtual-scroller`, Create, Update). |
| **API** | `/auth/*`, `/master-data/*`, `/constants`, `/admin/users/*`, `/admin/users/:userId/addresses`, `/admin/system-configs/*` |
| **Dependency** | None. (Độc lập khởi đầu) |
| **Estimate** | 6 Man-days |
| **Risk** | Kiến trúc thư mục setup sai từ đầu sẽ khó sửa về sau. Cấu hình interceptor Auth chưa chuẩn gây loop redirect. |
| **Priority** | **CRITICAL** (Blocker) |

### SPRINT 2: Cửa ngõ Khách hàng, Sản phẩm & Nội dung
**Mục tiêu:** Public website cho SEO, khách đặt hàng nhanh, Admin quản lý được Sản phẩm, Đánh giá và Blog.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | CMS, Products, Product Reviews, Orders (Public) |
| **Chức năng** | 1. Landing Page (Customer Site).<br>2. Giao diện Blog, Bài viết (Public) & **Quản lý Blog, Danh mục Blog (Admin)**.<br>3. Quản lý Danh mục & Sản phẩm (Admin).<br>4. **Quản lý Đánh giá sản phẩm** (Duyệt, Trả lời, Xóa).<br>5. Giao diện Đặt hàng nhanh (Form có Honeypot). |
| **API** | `/blog-categories`, `/posts`, `/admin/blog-categories/*`, `/admin/posts/*`, `/categories`, `/products`, `/admin/categories/*`, `/admin/products/*`, `/admin/product-reviews/*`, `POST /orders/quick` |
| **Dependency** | Sprint 1 (Layout & Component UI Kit) |
| **Estimate** | 7 Man-days |
| **Risk** | Honeypot ẩn bằng CSS không qua mặt được các bot hiện đại. Xử lý Upload ảnh (Preview/Resize) gây lag. |
| **Priority** | High |

### SPRINT 3: Nghiệp vụ Bán sỉ & Xử lý Đơn hàng (Core Business)
**Mục tiêu:** Áp dụng giá sỉ riêng, tạo/duyệt đơn hàng và xuất báo cáo.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Users (Custom Price), Orders (Admin), Exports |
| **Chức năng** | 1. Quản lý Bảng giá riêng cho User.<br>2. Danh sách, Chi tiết Đơn hàng (Admin).<br>3. Form tạo đơn Admin (Tự động map giá sỉ từ user, tự tính tổng tiền).<br>4. UX Flow: Copy đơn cũ tạo đơn mới.<br>5. **Xuất báo cáo dữ liệu** (Xuất Excel/CSV danh sách Đơn hàng & Đơn hàng hôm nay). |
| **API** | `/admin/users/:id/custom-prices`, `/admin/orders/*`, `/admin/exports/*` |
| **Dependency** | Users & Products (Phải có KH và SP mới tạo được đơn) |
| **Estimate** | 7 Man-days |
| **Risk** | Logic tính toán tổng tiền, thuế, giá sỉ đè giá gốc ở FE dễ bị lệch so với BE nếu validation form không chặt. |
| **Priority** | **CRITICAL** |

### SPRINT 4: Mobile App & Vận hành Giao nhận
**Mục tiêu:** Bàn giao đơn cho tài xế, tài xế chốt đơn trên App và nhận thông báo Push.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Orders (Batch Assign), Driver App, Realtime, Notifications |
| **Chức năng** | 1. Web Admin: Màn hình Batch Assign gán đơn cho tài xế.<br>2. Cài đặt Capacitor App và **SSE Realtime** (`EventSource`) để admin thấy tài xế chốt đơn tự động nhảy.<br>3. Lộ trình hôm nay (Driver) & **Lịch sử chuyến đi**.<br>4. Chức năng Chốt giao hàng: **Kéo trượt sang phải (Swipe to Confirm)**.<br>5. Lưu tạm **Offline Sync Queue** bằng `idb-keyval` khi rớt mạng 4G.<br>6. **Xin quyền Push Notification (FCM)** và hiển thị **Danh sách Thông báo** (Chuông báo). |
| **API** | `PATCH /admin/orders/batch-assign`, `/api/v1/driver/*`, `PATCH /api/v1/driver/orders/:id/deliver`, `GET /api/v1/driver/history`, `GET /api/v1/driver/notifications`, `GET /admin/events/sse`, `POST /api/v1/driver/device-tokens` |
| **Dependency** | Orders (Phải có đơn hàng mới chia được tuyến) |
| **Estimate** | 7 Man-days |
| **Risk** | Rớt mạng khi tài xế bấm chốt đơn $\rightarrow$ Phải làm queue lưu tạm UUID để retry. Tích hợp Push Notification (FCM) dễ gặp lỗi permission trên iOS. |
| **Priority** | **CRITICAL** |

### SPRINT 5: Kế toán, Kho vận & Thống kê
**Mục tiêu:** Hạch toán tiền bạc, quản lý nguyên vật liệu, kiểm soát tồn kho và xem biểu đồ.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Finance, Inventory, Raw Materials, Dashboard |
| **Chức năng** | 1. Sổ cái Kế toán & Thanh toán Nợ.<br>2. **Quản lý Danh mục Nguyên vật liệu** (Tạo, Sửa, Xóa nguyên liệu cơ bản).<br>3. Nhập/Xuất kho & Báo cáo Hao hụt.<br>4. Dashboard Biểu đồ Doanh thu (Chart.js/ECharts).<br>5. Thống kê Top Buyers. |
| **API** | `/admin/transactions/*`, `/admin/raw-materials/*`, `/admin/inventory/*`, `/admin/dashboard/*` |
| **Dependency** | Phải có luồng chốt đơn (Sprint 4) thì mới sinh ra Data Công nợ và Kho để hiển thị. |
| **Estimate** | 6 Man-days |
| **Risk** | Biểu đồ Time-series ở Dashboard bị sai lệch timezone (hiển thị sai ngày do UTC). |
| **Priority** | Medium |

### SPRINT 6: Cổng thông tin Khách sỉ (Wholesale Portal)
**Mục tiêu:** Cung cấp Dashboard cho khách sỉ tự theo dõi công nợ, đơn hàng và tự đặt hàng.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Customer Portal |
| **Chức năng** | 1. Dashboard Khách sỉ (Thống kê công nợ, đơn hàng).<br>2. Lịch sử đặt hàng cá nhân.<br>3. Form tự đặt hàng sỉ (Tự load bảng giá riêng). |
| **API** | `GET /api/v1/customer/orders`, `POST /api/v1/customer/orders`, `GET /api/v1/customer/debt` |
| **Dependency** | Phải có luồng tạo tài khoản (Sprint 1) và cài giá sỉ (Sprint 3). |
| **Estimate** | 6 Man-days |
| **Risk** | Phân quyền truy cập cần test kỹ để tránh Khách sỉ này nhìn thấy đơn hàng và công nợ của Khách sỉ khác. |
| **Priority** | High |

### SPRINT 7: Audit & Refinement (Kiểm toán hệ thống)
**Mục tiêu:** Tinh chỉnh UI/UX, tối ưu hóa toàn bộ hệ thống trước khi Go-live.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Core, UI/UX, Performance |
| **Chức năng** | 1. **Dark Mode Audit**: Fix lỗi độ tương phản, border ở chế độ tối.<br>2. **Responsive Audit**: Test hiển thị trên iPhone SE, Tablet, Desktop.<br>3. **Accessibility Audit**: Kiểm tra Tab navigation, screen reader.<br>4. **Performance Audit**: Lazy load `<NuxtImg>`, chống reflow/repaint.<br>5. **Empty States & Error Pages**: Tối ưu UI khi danh sách trống hoặc lỗi 404/500. |
| **API** | Không yêu cầu API mới. |
| **Dependency** | Phải hoàn thành toàn bộ Sprint 1 -> 6. |
| **Estimate** | 4 Man-days |
| **Risk** | Fix Responsive có thể làm vỡ layout của Dark Mode nếu viết CSS bất cẩn. |
| **Priority** | Medium |

---

## 3. Hệ thống Tiêu chuẩn (Checklists)

### 3.1. Definition of Done (Checklist Done)
*Tiêu chí để một Task (Ví dụ: Màn hình Danh sách Đơn hàng) được chuyển sang trạng thái DONE:*
- [ ] Code đã implement đầy đủ theo UI/UX Design (nếu có).
- [ ] Đã call đúng API thực tế (không dùng mock data nữa).
- [ ] Xử lý xong 3 trạng thái: `Loading`, `Error`, `Empty`.
- [ ] Đã viết Unit Test cho tầng Core/Mapper (nếu task yêu cầu).
- [ ] Không có warning hoặc error nào trên Console.

### 3.2. Checklist Review (Code Review)
*Dành cho Tech Lead khi approve Pull Request (PR):*
- [ ] Code tuân thủ ESLint & Prettier (Pass CI).
- [ ] Không fetch API trong Component trực tiếp (Phải qua Repository/Service).
- [ ] Biến môi trường không bị hardcode.
- [ ] Đã dọn dẹp các Event Listener / interval trong `onUnmounted` (Chống Memory Leak).
- [ ] Validation Form đã bọc đủ các trường (Không để lọt field required).
- [ ] Component không quá 400 dòng (Nếu lớn hơn, yêu cầu chẻ nhỏ).

### 3.3. Checklist Test (Quality Assurance)
*Dành cho QA / Tester:*
- [ ] Kiểm tra Responsive trên 3 độ phân giải (Mobile, Tablet, Desktop).
- [ ] Test nhập liệu Edge cases (Nhập text vào ô số, nhập số âm, nhập ký tự đặc biệt).
- [ ] Test rớt mạng (Tắt WiFi) khi đang Submit form $\rightarrow$ Có hiện thông báo lỗi không hay App bị treo?
- [ ] Test phân quyền (Dùng user Driver truy cập URL Admin xem có bị văng ra không).
- [ ] Xác nhận Token hết hạn thì hệ thống có tự văng ra màn hình Đăng nhập không.

### 3.4. Checklist Deploy
*Quy trình trước khi đẩy code lên Server (Staging/Production):*
- [ ] Update version trong `package.json`.
- [ ] Cập nhật file `.env` trên Server ứng với môi trường hiện tại.
- [ ] Build code local (`npm run build`) xem có lỗi Type-check (TypeScript) hay không.
- [ ] Check dung lượng Bundle size (không có thư viện nào bị phình to bất thường).
- [ ] Đảm bảo PM2 hoặc Docker đã cấu hình Restart policy.

### 3.5. Checklist UAT (User Acceptance Testing)
*Khách hàng (Chủ xưởng bún) nghiệm thu:*
- [ ] Luồng tạo đơn sỉ: Giá được tự động lấy đúng trong "Bảng giá riêng" không?
- [ ] Luồng chốt đơn (Driver): Trừ công nợ có khớp với tiền thực thu không?
- [ ] Copy đơn: Bấm copy có ra đúng các mặt hàng hôm qua khách đặt không?
- [ ] Trải nghiệm UX: Load trang có mượt không, thông báo thành công có dễ nhìn không?

### 3.6. Checklist Production (Go-live)
*Ngay sau khi hệ thống Online cho khách thật dùng:*
- [ ] Bật tool theo dõi lỗi (Sentry / LogRocket) để track Exception.
- [ ] Xóa toàn bộ Data rác (Test data) dùng trong quá trình UAT.
- [ ] Cấu hình Domain, kiểm tra chứng chỉ SSL (HTTPS).
- [ ] Thử Submit Form Đặt hàng nhanh để test Honeypot trên môi trường thật.
- [ ] Theo dõi tải CPU/RAM trên VPS trong 24h đầu.
