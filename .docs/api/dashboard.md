# Dashboard Module API Specification

Tài liệu này cung cấp thiết kế dữ liệu cho Giao diện Tổng quan (Trang chủ Admin).

---

## 1. GET `/api/v1/admin/dashboard/overview`

### 1. Tổng quan
- **Tên API**: Lấy thống kê số liệu tổng quan
- **Method**: `GET`
- **Module**: Dashboard
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Dữ liệu này được dùng để render 4 khối Panel trên cùng của Dashboard Admin: Tổng số Khách Hàng, Tổng Đơn Hàng Mới, Doanh Thu, và Số đầu mục vật liệu kho. Cho Giám đốc có cái nhìn toàn cảnh về hoạt động công ty.

### 3. Khi nào Frontend nên gọi
- Khi chuyển hướng vào trang route `/admin` (hoặc `/admin/dashboard`).

### 5. Request
- Không cần tham số. (API này sẽ scan toàn bộ CSDL hoặc scan theo tháng mặc định - tùy thiết lập).

### 6. Business Rule
- Backend thực thi một mảng Promise song song gọi tới 4 truy vấn SQL đếm/cộng tổng lớn nhất hệ thống. Dữ liệu nặng.

### 7. Response
- **Body**:
```json
{
  "totalUsers": 1500,
  "totalOrders": 120,
  "totalRevenue": "150000000.50",
  "totalMaterials": 56
}
```

### 10. Loading Strategy *(Recommended Practice)*
- Skeleton 4 ô chữ nhật trên đầu trang là chuẩn mực UX cho dạng API này. Tránh trang trắng tinh trong vài giây.

### 11. Cache Strategy *(Recommended Practice)*
- **Stale Time 1 phút**: Nếu người dùng bấm F5 liên tục hoặc chuyển qua lại giữa các tab Admin, Frontend không nên gọi liên tục xuống Backend. Vì API này gọi lệnh SQL `SUM()` và `COUNT(*)` rất tiêu tốn tài nguyên máy chủ. FE chỉ nên gọi lại sau mỗi chu kỳ 1 phút.
