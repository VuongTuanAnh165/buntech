# 📝 Cross-Agent Code Review Packet
**Session:** Phase 1 API Audit
**Target:** Phase 1 Implementation (System Configs, Uploads, Users, Quick Orders)
**Status:** 🔴 PENDING FIXES

## 1. Context & Scope
Dựa trên phản hồi từ Principal Engineer, AI đã tiến hành Audit (kiểm tra mã nguồn) lại toàn bộ Phase 1 theo quy trình `agentic-review-handoff`.

## 2. Issues Identified

### 🔴 Lỗi 1: Vi phạm Rule 16.4 & 16.16 (N+1 Query & Giữ Lock Transaction lâu)
- **Vị trí:** `PublicOrderService.createQuickOrder`
- **Mô tả:** Đang sử dụng vòng lặp `for` để gọi `Product.query().where('id', item.productId).first()` ở bên TRONG khối `db.transaction()`.
- **Hậu quả:** N+1 Query. Giữ lock Database không cần thiết cho thao tác đọc (Read).
- **# Fix Handoff:**
  1. Gom toàn bộ `productIds` thành mảng.
  2. Fetch `Product.query().whereIn('id', productIds)` ở NGOÀI và TRƯỚC `db.transaction()`.
  3. Lặp qua danh sách đã fetch để tính tiền.

### 🔴 Lỗi 2: Vi phạm Rule 3 (Validation không tập trung)
- **Vị trí:** `SystemConfigService.createConfig` và `system_config_validator.ts`
- **Mô tả:** Code đang check trùng lặp key thủ công bằng `SystemConfig.find(data.key)` trong Service thay vì dùng rule `unique` của VineJS.
- **# Fix Handoff:** Thêm rule `.unique(async (db, value) => { ... })` vào `createSystemConfigValidator`. Xóa logic check thủ công trong Service.

### 🔴 Lỗi 3: Vi phạm Rule 8 (Thiếu File Validation bằng VineJS)
- **Vị trí:** `UploadsController.store`
- **Mô tả:** Đang dùng cơ chế `request.file('image', { ... })` mặc định của Adonis. Rule 8 yêu cầu **bắt buộc** validate file bằng `vine.file()`.
- **# Fix Handoff:** Tạo một validator inline trong Controller hoặc ở file riêng dùng `vine.file({ extnames: [...], size: '5mb' })`. Sau đó validate qua `request.validateUsing(...)`.

### 🔴 Lỗi 4: Vi phạm Rule 24.B (Zero-Trust Legacy Code - Lỗi Hashing Password)
- **Vị trí:** `app/models/user.ts` và `UserService.createUser`
- **Mô tả:** Khảo sát Model `User` cho thấy model đang **KHÔNG CÓ** hook `@beforeSave()` để tự động hash mật khẩu. Khi Admin tạo User bằng API, password sẽ bị lưu thành plain-text, khiến khách không thể đăng nhập.
- **# Fix Handoff:** Cập nhật `app/models/user.ts` bổ sung hook hash password nếu password có sự thay đổi (`$dirty`).

## 3. Lời gọi Hành động (Action Required)
> 🚨 **AI Reviewer:** Tôi đã ghi nhận 4 lỗi kiến trúc quan trọng vào file Review Packet này theo đúng protocol chia tách trách nhiệm (Read-only review).

Vui lòng cấp lệnh `# Fix Handoff` hoặc `fix it` để tôi chuyển sang vai trò Implementer và tiến hành sửa trực tiếp vào mã nguồn!
