# Transaction (Finance) Module API Specification

Tài liệu này mô tả chi tiết các API liên quan đến quản lý dòng tiền, công nợ, và sổ cái giao dịch của hệ thống.

---

## 1. POST `/api/v1/admin/transactions/pay-debt`

### 1. Tổng quan
- **Tên API**: Thanh toán nợ thủ công (Thu tiền khách)
- **URL**: `/api/v1/admin/transactions/pay-debt`
- **Method**: `POST`
- **Module**: Transactions
- **Authentication Required**: Yes
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Khi khách hàng chuyển khoản trực tiếp cho Admin (Kế toán) để trả nợ cũ (thay vì trả cho tài xế), Kế toán dùng màn hình này để gạch nợ cho khách. Số tiền nợ hiện tại sẽ bị trừ.

### 3. Khi nào Frontend nên gọi
- Khi Kế toán ấn xác nhận Phiếu Thu / Gạch nợ.

### 5. Request
- **Body**:
  - `userId` (number, **required**): ID Khách hàng.
  - `amount` (number, **required**): Số tiền trả (phải lớn hơn 0).
  - `paymentMethod` (string, **required**): Ví dụ `BANK_TRANSFER`, `CASH`.
  - `referenceCode` (string, optional): Mã giao dịch ngân hàng / Mã phiếu thu.
  - `transactionDate` (date, optional): Ngày ghi nhận biến động (mặc định hôm nay).
  - `note` (string, optional): Ghi chú.

### 6. Business Rule
- **Lock Data**: Bảng `user_profiles` của khách bị lock. `currentDebt` tự động bị trừ đi `amount`.
- Ghi lại 1 log `Transaction` mang Type `PAYMENT`.

### 7. Response
- Trả về đối tượng `Transaction` vừa khởi tạo, kèm theo field phụ `newDebt` báo cho FE biết số nợ còn lại sau khi thanh toán.

### 9. Frontend Workflow
- Báo Toast thành công.
- Đóng Popup gạch nợ.
- Nếu đang đứng ở trang Chi tiết Khách Hàng, hãy gán `currentUser.profile.currentDebt = response.data.newDebt` (Optimistic update để khỏi phải GET lại profile).

### 12. Retry Strategy *(Recommended Practice)*
- **Tuyệt đối không Retry tự động**. Liên quan đến trừ nợ, nếu kẹt mạng FE gửi lặp 2 lần, khách sẽ bị trừ nợ 2 lần. Phải bắt kế toán tự bấm lại nếu lỗi.

---

## 2. GET `/api/v1/admin/finance/debt-summary`

### 1. Tổng quan
- **Tên API**: Báo cáo Tổng kết Công Nợ
- **URL**: `/api/v1/admin/finance/debt-summary`
- **Method**: `GET`
- **Permission**: Admin

### 2. Mục đích
Báo cáo toàn cảnh cho Giám đốc/Kế toán trưởng. Xem tổng số nợ đang kẹt bên ngoài và danh sách 10 khách hàng nợ nhiều nhất (Top Debtors).

### 7. Response
- **Body**:
  - `totalDebt` (string): Tổng cộng nợ của toàn bộ User có trong hệ thống.
  - `topDebtors` (Array): Mảng chứa object `{ id, fullName, phoneNumber, currentDebt }`.

---

## 3. GET `/api/v1/admin/transactions`

### 1. Tổng quan
- **Tên API**: Xem Sổ Cái Giao Dịch
- **URL**: `/api/v1/admin/transactions`
- **Method**: `GET`
- **Permission**: Admin

### 5. Request
- **Query**:
  - `page`, `limit` (Phân trang chuẩn).
  - `userId` (number, optional): Lọc lịch sử của 1 khách nhất định.
  - `type` (string, optional): Lọc theo `ORDER_CHARGE` (Nợ mới phát sinh) hoặc `PAYMENT` (Trả nợ).

### 6. Business Rule
- Trả về danh sách phân trang (sắp xếp giảm dần). 

### 10. Loading Strategy *(Recommended Practice)*
- Hiển thị Data Table Skeleton. 

---
