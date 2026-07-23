# Lộ trình Phát triển API Enterprise

Dựa trên tài liệu `required_api.md` và sau khi kiểm tra mã nguồn hiện tại của dự án (cấu trúc thư mục `BE/`, `app/controllers`, `app/models`, `database/migrations` và file `start/routes.ts`), tôi xin tóm tắt lại tình trạng hiện tại và đề xuất lộ trình (Implementation Plan) để xử lý hoàn toàn các API còn lại.

## Tình trạng hiện tại (Current State)

Tôi nhận thấy bạn đã thiết lập phần lõi rất tốt. Cụ thể:
- **Database & Models:** Toàn bộ migrations và models cho 16+ bảng nghiệp vụ đã được tạo đầy đủ (Users, Orders, Transactions, Products, SystemConfigs, ...).
- **Module đã hoàn thành:** 
  - **M1 (IAM Auth):** Đã có `login`, `refresh`, `me`.
  - **M2 (Master Data):** Đã có API lấy dữ liệu hành chính (Divisions).
  - **M3 (Catalog & Content):** Đã hoàn thành 100% CRUD cho Admin và Client (Blog Categories, Posts, Categories, Products, Product Reviews).
- **Module chưa bắt đầu:** M4 (CRM), M5 (Orders), M6 (Logistics), M7 (Finance), M8 (Production), M9 (Reporting).

## Proposed Changes (Lộ trình phát triển đề xuất)

Dựa trên cấu trúc Agile Sprint trong tài liệu, chúng ta sẽ bắt đầu làm từ những phần còn thiếu của Sprint 1 & 2 trước khi tiến hành các logic phức tạp về Dòng tiền và Vận hành.

Dưới đây là kế hoạch chi tiết cho các đầu việc tôi sẽ thực hiện, xin bạn xem xét và phê duyệt.

---

### Phase 1: Hoàn thiện nền tảng & Public API (Sprint 1 & 2)

Hoàn thành nốt các cấu hình hệ thống, quản trị User và luồng đặt hàng nhanh (Lead Generation) cho khách vãng lai.

#### Master Data & Configs (M2)
- Khởi tạo `SystemConfigsController` để xử lý cấu hình hệ thống chung (CRUD `/admin/system-configs`).
- Bổ sung chức năng Upload ảnh (`/admin/upload`). Tạm thời lưu local hoặc giả lập URL nếu chưa có S3.

#### IAM Quản trị Users (M1)
- Khởi tạo `UsersController` với CRUD (`/admin/users`) để thêm/sửa/xóa Admin, Driver và Khách sỉ.
- Xây dựng API đổi mật khẩu (`/admin/users/:id/change-password`).

#### Đặt hàng nhanh (M5 - Quick Order)
- Khởi tạo `PublicOrdersController`.
- API `POST /public/orders/quick`: Có chức năng Honeypot và VineJS Validation. (Lưu đơn ở trạng thái PENDING).

---

### Phase 2: CRM & Finance - Dòng tiền & Công nợ (Sprint 3)

Đây là Phase xương sống về nghiệp vụ tài chính.

#### Customer Relationship Management (M4)
- **Hạn mức & Hồ sơ:** API cập nhật `debt_limit` (hạn mức nợ) cho khách hàng (`PUT /admin/users/:id/profile`).
- **Sổ địa chỉ:** `AddressesController` để quản lý nhiều điểm giao hàng của khách sỉ.
- **Bảng giá riêng:** `CustomerPricesController` cho phép lưu các mức giá chiết khấu riêng cho từng khách hàng sỉ (`/admin/users/:id/custom-prices`).

#### Finance & Sổ cái (M7)
- Khởi tạo `TransactionsController`.
- API lấy danh sách Sổ cái các khoản thu chi/công nợ (`GET /admin/transactions`).
- API thanh toán nợ (`POST /admin/transactions/pay-debt`) và cập nhật `current_debt` của `user_profiles`. (Sử dụng DB Transaction để đảm bảo tính toàn vẹn).
- API Tổng kết nợ (`GET /admin/finance/debt-summary`).

#### Admin Orders (M5)
- Khởi tạo `AdminOrdersController`.
- Quản trị toàn bộ vòng đời đơn hàng (`GET`, `POST`, `PUT` cho `/admin/orders`). Cập nhật logic để ưu tiên lấy giá từ `customer_prices` thay vì giá gốc khi tạo đơn cho khách sỉ.
- Thay đổi trạng thái đơn (`PATCH /status`) và gán tài xế hàng loạt (`PATCH /batch-assign`).

---

### Phase 3: Logistics & Sản xuất (Sprint 4)

Phục vụ các hoạt động thực địa lúc 4h sáng.

#### App Tài xế (M6 - Logistics)
- Đăng ký nhận thông báo (`POST /driver/device-tokens`).
- Khởi tạo `DriverRoutesController`: Lấy tuyến đường cần giao trong ngày (`GET /driver/routes/today`).
- Khởi tạo `DriverOrdersController`: Chốt giao hàng thành công và thu tiền (`PATCH /driver/orders/:id/deliver`). Tích hợp logic DB Transaction liên kết với `Transactions` và công nợ để tránh xung đột (Idempotency Key).

#### Quản lý Sản xuất & Tồn kho (M8)
- CRUD cho Nguyên vật liệu Gạo, bột (`/admin/raw-materials`).
- API Nhập kho nguyền liệu (`/admin/inventory/import`).
- API Ghi nhận ca sản xuất (`/admin/production/log-batch`) để tự động tính hao hụt sản xuất.

---

### Phase 4: Báo cáo & Dashboard (Sprint 5)

Tổng hợp và xuất báo cáo.

#### Reporting (M9)
- Dashboard overview (`GET /admin/dashboard/overview`) về Doanh thu, Đơn hàng, Nợ.
- Biểu đồ hao hụt sản xuất (`/admin/reports/production-yield`).
- Xuất dữ liệu đơn hàng ra Excel (`/admin/exports/orders-today`).

---

## Verification Plan

### Automated Tests
- Nếu dự án có sử dụng Unit Test, tiến hành viết test (bằng Japa) cho các class Service cốt lõi như `FinanceService.ts` (logic cộng trừ nợ) và `OrderService.ts` (logic lấy đúng giá `customer_prices`).

### Manual Verification
- Cấu hình file request `.http` cho từng endpoint để chạy thử.
- Xem log Database (Query log) để đảm bảo không bị lỗi N+1 Query.
