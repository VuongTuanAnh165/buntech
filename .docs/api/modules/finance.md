# Finance & Transactions Module

Module này quản lý Sổ cái Kế toán (Transactions) và luồng Công nợ (Debt) của khách hàng sỉ.

Tất cả các API trong module này đều có prefix `/api/v1/admin/transactions` hoặc `/api/v1/admin/finance` và yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Danh sách Sổ cái (Transactions)
- **URL**: `GET /api/v1/admin/transactions`
- **Query Params**:
  - `page`, `limit` (Phân trang)
  - `userId` (Lọc theo khách hàng)
  - `type` (Loại giao dịch: VD `PAYMENT`, `REFUND`, `DEBT_INCREASE`,...)
- **Mục đích**: Xem lịch sử thu chi, tăng giảm công nợ của hệ thống.

### Response 
Trả về danh sách giao dịch phân trang. Mỗi dòng giao dịch (`transaction`) đại diện cho một thao tác tài chính, có chứa `amount`, `type`, `referenceId` (ví dụ ID đơn hàng).

---

## 2. Thanh toán nợ (Pay Debt)
- **URL**: `POST /api/v1/admin/transactions/pay-debt`
- **Mục đích**: Ghi nhận khách hàng trả bớt nợ (Ví dụ khách chuyển khoản trả 5 triệu).
- **Request Body**:
  - `userId`: ID Khách hàng
  - `amount`: Số tiền trả
  - `paymentMethod`: Phương thức (Tiền mặt, Chuyển khoản...)
  - `note`: Ghi chú (VD: "Khách CK trả nợ tháng 7")
  - `transactionDate`: (Tùy chọn) Ngày giao dịch thực tế
- **Business Flow**:
  1. Validate dữ liệu đầu vào.
  2. Tạo Record trong bảng `transactions` (loại `DEBT_PAYMENT` / `PAYMENT`).
  3. Trừ trực tiếp số tiền này vào `current_debt` của User Profile.
  4. Quá trình này được bọc trong Database Transaction.

---

## 3. Tổng kết Công nợ (Debt Summary)
- **URL**: `GET /api/v1/admin/finance/debt-summary`
- **Mục đích**: Cung cấp số liệu thống kê nhanh cho Kế toán / Quản lý.

### Response (200 OK)
Trả về object chứa tổng nợ toàn hệ thống (`totalDebt`) và danh sách top các khách hàng nợ nhiều nhất (`topDebtors`).
