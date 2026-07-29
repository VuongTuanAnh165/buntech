# Báo Cáo Độ Phủ Tài Liệu API (Coverage Report)

Báo cáo này liệt kê quá trình phân tích và tài liệu hóa toàn bộ codebase Buntech Backend.

## 1. Thống Kê Tổng Quan

- **Tổng số Route định nghĩa trong `routes.ts`**: Khoảng 83 endpoint.
- **Tổng số API đã được tài liệu hóa**: 80 endpoint.
- **Các Route bị bỏ qua**: 
  - `GET /` (Route test Hello World).
  - `GET /swagger` và `GET /docs` (Môi trường Dev không nằm trong API public).

Tỷ lệ bao phủ (Coverage) so với các Route nghiệp vụ đạt: **100%**.

## 2. Danh Sách API / Method Thừa (Dead Code)

Trong quá trình phân tích, hệ thống phát hiện các hàm trong Controller không được gọi/mapping trong file `routes.ts`:

- **`ExportsController.exportOrders`**: Hàm này nhận `startDate`, `endDate` để xuất báo cáo đơn hàng dạng CSV, nhưng **KHÔNG CÓ** route nào map tới hàm này. (Route duy nhất hiện đang map là `exportOrdersToday`). -> *Đề xuất bổ sung route hoặc xóa hàm nếu không dùng đến.*

## 3. Danh Sách Endpoint Chưa Thể Phân Tích Hoàn Toàn

- **Cấu trúc DTO từ VineJS**: Do VineJS Schema đôi lúc phức tạp (dùng custom rules), một số ràng buộc phức tạp không thể liệt kê 100% trong bảng request (như custom regex validator).
- **Luồng tính toán Công nợ (Debt)**: Tài liệu mới dừng ở mức mô tả logic ("tự động cộng trừ vào current_debt"). Để hiểu cặn kẽ thuật toán, DEV cần đọc thẳng vào logic Repository.

## 4. Danh Sách Endpoint Cần Xác Minh Thủ Công (Manual Verification)

Các API dưới đây có logic nghiệp vụ phức tạp, thay đổi dữ liệu trên nhiều bảng, yêu cầu QA / DEV test kỹ lưỡng bằng Postman thay vì chỉ đọc tài liệu:

1. `POST /api/v1/admin/orders`: Quá trình tạo đơn hàng cho khách sỉ (Kiểm tra xem hệ thống có áp dụng chuẩn Bảng Giá Riêng không).
2. `PATCH /api/v1/driver/orders/:id/deliver`: Hàm chốt giao hàng của Tài xế (Liên quan tới chốt doanh thu, cập nhật Công nợ, và Idempotency). Cần test giả lập lỗi mạng để check tính Idempotency.
3. `POST /api/v1/admin/inventory/import`: Thao tác ghi log và cập nhật bảng nguyên vật liệu đồng thời.
