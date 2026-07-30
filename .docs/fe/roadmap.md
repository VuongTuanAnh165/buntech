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

### SPRINT 1: Nền tảng lõi & Quản lý Khách hàng
**Mục tiêu:** Setup xong dự án, đăng nhập thành công và quản lý được thông tin khách sỉ.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Core, Auth, Master Data, Users |
| **Chức năng** | 1. **Khởi tạo:** `npx nuxi init FE`, cài đặt **ESLint + Husky** khắt khe.<br>2. Màn hình Login, **Quên mật khẩu**, **Đổi mật khẩu**.<br>3. Layout Admin (Sidebar, Header).<br>4. Lấy Master Data (Tỉnh thành, Enum) có ETag.<br>5. Quản lý Khách hàng (List ảo hóa với `vue-virtual-scroller`, Create, Update). |
| **API** | `/auth/login`, `/auth/me`, `/master-data/*`, `/constants`, `/admin/users/*` |
| **Dependency** | None. (Độc lập khởi đầu) |
| **Estimate** | 5 Man-days |
| **Risk** | Kiến trúc thư mục setup sai từ đầu sẽ khó sửa về sau. Cấu hình interceptor Auth chưa chuẩn gây loop redirect. |
| **Priority** | **CRITICAL** (Blocker) |

### SPRINT 2: Cửa ngõ Khách hàng & Sản phẩm
**Mục tiêu:** Public website cho SEO, khách vãng lai tự đặt hàng nhanh, Admin quản lý được danh mục sản phẩm.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | CMS, Products, Orders (Public) |
| **Chức năng** | 1. Landing Page (Customer Site).<br>2. Giao diện Blog, Bài viết.<br>3. Quản lý Danh mục & Sản phẩm (Admin).<br>4. Giao diện Đặt hàng nhanh (Form có Honeypot). |
| **API** | `/blog-categories`, `/posts`, `/categories`, `/products`, `POST /orders/quick` |
| **Dependency** | Sprint 1 (Layout & Component UI Kit) |
| **Estimate** | 6 Man-days |
| **Risk** | Honeypot ẩn bằng CSS không qua mặt được các bot hiện đại. Xử lý Upload ảnh (Preview/Resize) gây lag. |
| **Priority** | High |

### SPRINT 3: Nghiệp vụ Bán sỉ & Xử lý Đơn hàng (Core Business)
**Mục tiêu:** Áp dụng giá sỉ riêng và Admin tạo/duyệt đơn hàng thành công.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Users (Custom Price), Orders (Admin) |
| **Chức năng** | 1. Quản lý Bảng giá riêng cho User.<br>2. Danh sách & Chi tiết Đơn hàng (Admin).<br>3. Form tạo đơn Admin (Tự động map giá sỉ từ user, tự tính tổng tiền).<br>4. UX Flow: Copy đơn cũ tạo đơn mới. |
| **API** | `/admin/users/:id/custom-prices`, `/admin/orders/*` |
| **Dependency** | Users & Products (Phải có KH và SP mới tạo được đơn) |
| **Estimate** | 7 Man-days |
| **Risk** | Logic tính toán tổng tiền, thuế, giá sỉ đè giá gốc ở FE dễ bị lệch so với BE nếu validation form không chặt. |
| **Priority** | **CRITICAL** |

### SPRINT 4: Mobile App & Vận hành Giao nhận
**Mục tiêu:** Bàn giao đơn cho tài xế và tài xế chốt đơn thành công trên App Mobile.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Orders (Batch Assign), Driver App, Realtime |
| **Chức năng** | 1. Web Admin: Màn hình Batch Assign gán đơn cho tài xế.<br>2. Cài đặt Capacitor App và **SSE Realtime** (`EventSource`) để admin thấy tài xế chốt đơn tự động nhảy.<br>3. Lộ trình hôm nay (Driver).<br>4. Chức năng Chốt giao hàng: **Kéo trượt sang phải (Swipe to Confirm)**.<br>5. Lưu tạm **Offline Sync Queue** bằng `idb-keyval` khi rớt mạng 4G. |
| **API** | `PATCH /admin/orders/batch-assign`, `/driver/*`, `PATCH /driver/orders/:id/deliver`, `GET /admin/events/sse` |
| **Dependency** | Orders (Phải có đơn hàng mới chia được tuyến) |
| **Estimate** | 6 Man-days |
| **Risk** | Rớt mạng khi tài xế bấm chốt đơn $\rightarrow$ Phải làm queue lưu tạm UUID để retry. Build iOS/Android bằng Capacitor gặp lỗi native. |
| **Priority** | **CRITICAL** |

### SPRINT 5: Kế toán, Kho vận & Thống kê
**Mục tiêu:** Hạch toán tiền bạc, kiểm soát tồn kho và xem biểu đồ.

| Hạng mục | Chi tiết |
| --- | --- |
| **Module** | Finance, Inventory, Dashboard |
| **Chức năng** | 1. Sổ cái Kế toán & Thanh toán Nợ.<br>2. Nhập/Xuất kho & Báo cáo Hao hụt.<br>3. Dashboard Biểu đồ Doanh thu (Chart.js/ECharts).<br>4. Thống kê Top Buyers. |
| **API** | `/admin/transactions/*`, `/admin/inventory/*`, `/admin/dashboard/*` |
| **Dependency** | Phải có luồng chốt đơn (Sprint 4) thì mới sinh ra Data Công nợ và Kho để hiển thị. |
| **Estimate** | 5 Man-days |
| **Risk** | Biểu đồ Time-series ở Dashboard bị sai lệch timezone (hiển thị sai ngày do UTC). |
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
