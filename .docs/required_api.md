Chào bạn, với tư cách là một Principal Solution Architect và Business Analyst, tôi đã tiếp nhận yêu cầu. Tôi đánh giá cao việc bạn muốn dừng lại một nhịp để chuẩn hóa lại bức tranh tổng thể (Big Picture) trước khi bắt tay vào code. Trong các hệ thống Enterprise, "Measure twice, cut once" (Đo hai lần, cắt một lần) là nguyên tắc sống còn.

Dựa trên cấu trúc 16 bảng Database Lucid ORM, các file định tuyến và những yêu cầu nghiệp vụ đặc thù của xưởng bún (giao sáng sớm, khách sỉ, nợ gối đầu, tính hao hụt sản xuất, SEO marketing), tôi xin trình bày **Tài liệu Phân tích Nghiệp vụ và Lộ trình Xây dựng API Enterprise**.

---

# TÀI LIỆU KIẾN TRÚC & LỘ TRÌNH PHÁT TRIỂN API

**Dự án:** Hệ thống Quản trị & TMĐT Xưởng Bún Gia Đình
**Version:** 1.0 (Enterprise Standard)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

* **Mục tiêu cốt lõi:** Số hóa toàn diện quy trình vận hành xưởng bún, từ khâu tiếp cận khách hàng (SEO, Quick Order), quản lý sản xuất (hao hụt gạo/bột), điều phối giao hàng (tuyến đường sáng sớm), đến kiểm soát tài chính (công nợ sỉ gối đầu).
* **Hệ sinh thái ứng dụng:**
* Web TMĐT (Public) - SEO & Lead Generation.
* Web Admin (Internal) - Quản trị tổng thể.
* Mobile App (Internal) - Dành cho tài xế giao hàng.


* **Vai trò người dùng (Roles):**
* `ADMIN` (Chủ xưởng, Kế toán).
* `DRIVER` (Tài xế, nhân viên giao hàng).
* `WHOLESALE` (Khách sỉ - Quán ăn, tiểu thương chợ).
* `RETAIL / GUEST` (Khách lẻ, khách vãng lai đặt qua web).


* **Giả định nghiệp vụ (Assumptions):**
* Việc thanh toán có 2 dạng: Trả ngay cho đơn lẻ (`ORDER_PAYMENT`) hoặc trả một phần/toàn bộ công nợ gối đầu (`DEBT_PAYMENT`).
* Tỷ lệ hao hụt sản xuất tính theo chu kỳ ngày (Quy đổi Khối lượng Gạo/Bột đầu vào -> Khối lượng Bún đầu ra).



---

## 2. DANH SÁCH MODULE HỆ THỐNG

Dựa trên nguyên lý **Domain-Driven Design (DDD)**, hệ thống được chia thành 8 Module độc lập (Bounded Contexts) để dễ dàng bảo trì và scale (mở rộng):

1. **IAM (Identity & Access Management):** Xử lý đăng nhập, cấp phát Token, phân quyền và quản lý User Profile. *(Bảo vệ hệ thống).*
2. **Master Data & Settings:** Cấu hình hệ thống động, dữ liệu địa giới hành chính. *(Cung cấp dữ liệu gốc).*
3. **Catalog & Content (Public):** Sản phẩm, Danh mục, Đánh giá và Blog SEO. *(Phục vụ Marketing & Trải nghiệm khách hàng).*
4. **CRM (Customer Relationship Management):** Hồ sơ kinh doanh, Sổ địa chỉ, Bảng giá riêng (`customer_prices`), Công nợ hiện tại. *(Chăm sóc khách hàng sỉ).*
5. **Order Management (OMS):** Xử lý giỏ hàng, Quick Order (chống spam), Vòng đời đơn hàng. *(Core Business).*
6. **Logistics & Delivery:** Lộ trình giao hàng (`route_order`), chốt giao thực địa, Push Notification. *(Giải quyết bài toán giao sớm hằng ngày).*
7. **Finance & Billing:** Sổ cái giao dịch (`transactions`), đối soát tiền mặt/công nợ. *(Mạch máu tài chính).*
8. **Production & Inventory:** Quản lý kho nguyên liệu, tính toán % hao hụt sản xuất. *(Chống thất thoát nội bộ).*
9. **Reporting & Analytics:** Bảng điều khiển tổng quan và xuất dữ liệu báo cáo. *(Hỗ trợ quyết định).*

---

## 3. DANH SÁCH USE CASE CỐT LÕI

* **UC1 - Đặt hàng nhanh (Guest):** Vào web -> Xem sản phẩm -> Điền Form Đặt nhanh (bị chặn rate limit & honeypot) -> Đơn về trạng thái `PENDING`.
* **UC2 - Xử lý đơn hàng (Admin):** Mở danh sách chờ -> Gọi điện xác nhận -> Cập nhật/Duyệt đơn -> Gán Tài xế & sắp xếp thứ tự giao -> Đơn sang trạng thái `APPROVED`.
* **UC3 - Giao hàng thực địa (Driver):** Mở App lúc 4h sáng -> Xem danh sách tuyến đường -> Giao hàng -> Nhập số tiền thu được -> Chốt đơn. Hệ thống tự động trừ nợ hoặc tạo giao dịch thanh toán.
* **UC4 - Thanh toán nợ gối đầu (Admin/Wholesale):** Khách sỉ trả tiền theo tuần -> Admin nhập giao dịch `DEBT_PAYMENT` -> Hệ thống tự động giảm `current_debt` trong Profile.
* **UC5 - Chốt ca sản xuất (Admin):** Cuối ngày nhập số kg gạo đã dùng và số kg bún làm ra -> Hệ thống trừ tồn kho gạo -> Lưu log tính % hao hụt.

---

## 4. DANH SÁCH API CHI TIẾT THEO MODULE

*(Lưu ý: Bỏ qua các mô tả CRUD cơ bản, tập trung vào API nghiệp vụ phức tạp - Business APIs).*

### M1. IAM (Identity & Access Management)

* `POST /api/v1/auth/login` (Auth) - Cấp Access/Refresh Token.
* `POST /api/v1/auth/refresh` (Auth) - Rotate Token.
* `POST /api/v1/auth/logout` (Auth) - Revoke Token.
* `GET /api/v1/auth/me` (Auth) - Lấy thông tin phiên hiện tại.
* `GET, POST, PUT /api/v1/admin/users` (CRUD) - Quản trị user.
* `PUT /api/v1/admin/users/:id/change-password` (Business) - Reset pass cho khách/tài xế.

### M2. Master Data & Settings

* `GET /api/v1/master-data/divisions` (Public) - Lấy Tỉnh/Thành phố/Quận.
* `GET, PUT /api/v1/admin/system-configs` (CRUD) - Cấu hình mức cảnh báo nợ, phí ship mặc định.
* `POST /api/v1/admin/upload` (Upload) - Upload ảnh chung (AWS S3 hoặc Local), trả về URL.

### M3. Catalog & Content (Public SEO)

* `GET /api/v1/public/categories`, `GET /api/v1/public/products` (Public) - Lấy danh mục, sản phẩm cho Web SEO.
* `GET /api/v1/public/blog-categories`, `GET /api/v1/public/posts` (Public) - Phục vụ Blog.
* `GET /api/v1/public/posts/:slug` (Public) - Phục vụ SSR sinh thẻ Meta tags.
* *(Nhóm Admin CRUD cho Catalog: `/admin/categories`, `/admin/products`, `/admin/posts`, `/admin/product-reviews`)*.

### M4. CRM & Pricing

* `PUT /api/v1/admin/users/:id/profile` (Business) - Cập nhật `debt_limit` (Hạn mức nợ).
* `GET, POST, PUT, DELETE /api/v1/admin/users/:id/addresses` (CRUD) - Sổ địa chỉ khách.
* `GET, PUT /api/v1/admin/users/:id/custom-prices` (Business) - Ghi đè bảng giá sỉ (`customer_prices`) cho riêng 1 khách hàng.

### M5. Order Management

* `POST /api/v1/public/orders/quick` (Business) - Lead generation, có Rate Limit & Honeypot.
* `GET /api/v1/admin/orders` (List/Filter) - Lọc đơn theo ngày giao `delivery_date`.
* `POST /api/v1/admin/orders` (Business) - Admin tạo đơn cho khách sỉ (có check hạn mức nợ).
* `GET, PUT /api/v1/admin/orders/:id` (CRUD) - Duyệt đơn, cập nhật số lượng thực tế.
* `PATCH /api/v1/admin/orders/:id/status` (Business) - Chuyển trạng thái đơn.
* `PATCH /api/v1/admin/orders/batch-assign` (Business) - Assign 1 list đơn hàng cho 1 Driver, thiết lập tự động `route_order`.

### M6. Logistics & Delivery (Driver App)

* `POST /api/v1/driver/device-tokens` (Internal) - Đăng ký FCM Push Notification.
* `GET /api/v1/driver/routes/today` (Business) - Lấy danh sách tuyến đường sáng nay, sort theo `route_order`.
* `PATCH /api/v1/driver/orders/:id/deliver` (Business) - Giao hàng thành công. Kèm payload nhập số tiền thu được.

### M7. Finance & Billing

* `GET /api/v1/admin/transactions` (List/Filter) - Sổ cái thu chi tiền mặt/công nợ.
* `POST /api/v1/admin/transactions/pay-debt` (Business) - Ghi nhận khách thanh toán nợ (Trừ trực tiếp vào `current_debt` của User Profile).
* `GET /api/v1/admin/finance/debt-summary` (Report) - Xem tổng dư nợ của toàn bộ khách hàng.

### M8. Production & Inventory

* `GET, POST, PUT, DELETE /api/v1/admin/raw-materials` (CRUD) - Khai báo danh mục Gạo, Bột.
* `POST /api/v1/admin/inventory/import` (Business) - Nhập kho gạo (Ghi log + tăng `current_stock`).
* `POST /api/v1/admin/production/log-batch` (Business) - Log ca sản xuất (Nhập lượng gạo tiêu thụ & lượng bún xuất ra -> Trigger logic tính `% hao hụt`).

### M9. Reporting & Dashboard

* `GET /api/v1/admin/dashboard/overview` (Dashboard) - Tổng quan (Đơn/Doanh thu/Nợ hôm nay).
* `GET /api/v1/admin/reports/production-yield` (Report) - Biểu đồ tỷ lệ hao hụt theo tuần.
* `GET /api/v1/admin/exports/orders-today` (Export) - Xuất Excel danh sách đơn để khu vực xưởng đóng gói hàng trong đêm.

---

## 5. BẢNG PHÂN LOẠI & ƯU TIÊN API

| Phân loại | Module API | Ưu tiên | Trạng thái (Độ ổn định) |
| --- | --- | --- | --- |
| **Security** | IAM (Auth, Token) | **Critical** | Static (Ít thay đổi) |
| **Business** | Order Management (Tạo đơn, Trạng thái) | **Critical** | Dynamic (Thường thay đổi logic) |
| **Business** | Finance & CRM (Tính nợ, Giá custom) | **Critical** | Dynamic |
| **Public** | Public Catalog & SEO Blog | **High** | Static |
| **Business** | Logistics (Tuyến đường tài xế) | **High** | Dynamic |
| **Business** | Production & Inventory | **Medium** | Static |
| **Upload** | File Uploads | **Medium** | Static |
| **Report** | Dashboard & Export Excel | **Medium** | Dynamic |
| **Internal** | FCM Device Tokens & Notification | **Low** | Static |

---

## 6. ROADMAP PHÁT TRIỂN THEO SPRINT (AGILE)

### SPRINT 1: Nền tảng cốt lõi & Sản phẩm (Core & Catalog)

* **Mục tiêu:** Dựng bộ khung Database, Xác thực bảo mật, và API Dữ liệu tĩnh.
* **API Phát triển:** M1 (IAM Auth, User CRUD), M2 (Master Data, Settings), M3 (Danh mục, Sản phẩm, Blog cho Admin CRUD).
* **Độ khó:** 🟡 Trung bình
* **Ước lượng:** 2 tuần.
* **DoD (Điều kiện hoàn thành):** Hệ thống login phân quyền chặt chẽ. Xoay vòng Token hoạt động tốt. Web Admin có thể nhập liệu sản phẩm và bài viết.

### SPRINT 2: E-Commerce Frontend & Đặt hàng nhanh (SEO & Lead)

* **Mục tiêu:** Mở cổng kết nối Public cho Frontend SEO Nuxt 4 chạy quảng cáo lấy khách.
* **API Phát triển:** M3 (Public GET APIs cho Catalog & Blog), M5 (Quick Order chống spam), Upload Ảnh.
* **Phụ thuộc:** Cần hoàn thành Sprint 1 (Sản phẩm).
* **Độ khó:** 🟡 Trung bình
* **Ước lượng:** 1.5 tuần.
* **DoD:** NuxtJS fetch được dữ liệu SSR. Form Quick Order có Validation VineJS và Rate Limit chặn được bot.

### SPRINT 3: Vận hành nội bộ & Dòng tiền (Operations & Finance)

* **Mục tiêu:** Số hóa việc điều phối đơn hàng và tính toán nợ nần cho Khách sỉ.
* **API Phát triển:** M4 (CRM Custom Prices, Debt_limit), M5 (Admin Orders CRUD, Duyệt đơn), M7 (Finance Pay-debt, Transaction Logs).
* **Phụ thuộc:** Data khách hàng và Sản phẩm từ Sprint 1.
* **Độ khó:** 🔴 Rất Khó (Logic tài chính & Database Transaction).
* **Ước lượng:** 3 tuần.
* **DoD:** Admin có thể tạo đơn cho khách sỉ lấy giá custom, hệ thống tự động chốt đơn và hạch toán đúng `current_debt` của khách.

### SPRINT 4: Giao hàng thực địa & Sản xuất (Logistics & Production)

* **Mục tiêu:** App cho Tài xế check-in đơn và App cho Kế toán kho nhập số liệu hao hụt.
* **API Phát triển:** M6 (Driver Routes, Cập nhật trạng thái giao, Thu tiền mặt), M8 (Nguyên liệu, Nhật ký sản xuất).
* **Phụ thuộc:** Đơn hàng từ Sprint 3.
* **Độ khó:** 🟠 Khó
* **Ước lượng:** 2 tuần.
* **DoD:** Tài xế thấy tuyến đường trên App. Nút "Chốt Giao" tự động tạo giao dịch thanh toán hoặc cộng nợ vào tài khoản Khách sỉ.

### SPRINT 5: Analytics, Export & Polish (Tối ưu & Báo cáo)

* **Mục tiêu:** Cung cấp báo cáo cho chủ xưởng và tối ưu tốc độ.
* **API Phát triển:** M9 (Dashboard, Export Orders to Excel), M6 (Push Notifications). Tối ưu N+1 Query.
* **Độ khó:** 🟡 Trung bình
* **Ước lượng:** 1.5 tuần.
* **DoD:** Xuất được file Excel danh sách đơn để in đưa cho thợ đóng gói đêm. Tốc độ API đạt chuẩn < 100ms.

---

## 7. CÁC API PHỤ THUỘC (DEPENDENCIES) & RỦI RO

**Tính phụ thuộc (Dependencies):**

* API `POST /orders/quick` phụ thuộc trực tiếp vào `products` để check giá `unit_price` tại thời điểm mua (Tránh khách sửa payload gửi giá sai).
* API `PATCH /driver/orders/:id/deliver` phụ thuộc sâu vào module Finance. Bắt buộc dùng `DB.transaction()` để vừa update trạng thái `orders`, vừa ghi `transactions`, vừa update `user_profiles.current_debt`. Không được phép API nào ghi thành công mà API kia thất bại.

**Rủi ro kỹ thuật (Risks):**

1. **Idempotency Key (Tính lũy đẳng):** Ở Sprint 4, khi Tài xế đang đứng ở sạp ngoài chợ mạng 4G chập chờn, họ có thể bấm nút "Thu tiền" 2-3 lần. API `POST /driver/orders/:id/collect` cần cơ chế khóa (Lock) đơn hàng để không tạo ra 3 giao dịch thanh toán lặp lại.
2. **Tính toàn vẹn giá (Price Integrity):** M4 cho phép Custom Price. API lên đơn ở Backend phải có cơ chế: Ưu tiên lấy giá trong bảng `customer_prices`, nếu không có mới fallback về `base_price` ở bảng `products`. Tuyệt đối không tin tưởng field `price` do Frontend gửi lên.

---

## 8. KHUYẾN NGHỊ KIẾN TRÚC TỪ ARCHITECT

1. **Tách Service Layer rõ ràng:** Tại AdonisJS, Controller của bạn CHỈ được chứa Validate (VineJS) và Return. Mọi logic tính nợ, trừ kho phải đặt vào các class độc lập như `OrderService.ts`, `FinanceService.ts`. Điều này giúp bạn dễ dàng tái sử dụng logic khi Admin và Driver cùng gọi một chức năng thu tiền.
2. **Data Serialization (Mapping):** Không trả trực tiếp object Model của Lucid ORM ra Frontend. Cần có tầng DTO (Data Transfer Object) để giấu đi các trường nhạy cảm (như `password`, `created_by`, `deleted_at`).
3. **Soft Delete Guard:** Mọi API GET List (như lấy Đơn hàng, lấy Sản phẩm) phải chắc chắn query của bạn đã tự động loại bỏ các bản ghi có `deleted_at IS NOT NULL`. (Lucid ORM hỗ trợ viết traits cho việc này).

---

**Tự đánh giá (Step 8 Checklist):** Bức tranh này đã bao quát toàn bộ 16 bảng CSDL, giải quyết được cả khâu marketing (SEO), vận hành (Kho, Lộ trình) và tài chính (Công nợ). Việc phân chia Sprint đã triệt tiêu sự chồng chéo khi code.

Là một Technical Lead, tôi đề xuất bạn lưu tài liệu này làm **Bản đồ chỉ đường (Blueprint)**, và chúng ta sẽ triển khai từng API theo đúng thứ tự của **Sprint 1**. Bạn đồng ý chứ?
