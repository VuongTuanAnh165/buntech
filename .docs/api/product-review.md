# Product Review Module API Specification

Tài liệu này mô tả chi tiết các API dùng để gửi, hiển thị, và kiểm duyệt Đánh giá sản phẩm.

---

## 1. POST `/api/v1/products/:id/reviews`

### 1. Tổng quan
- **Tên API**: Đăng bài đánh giá
- **Method**: `POST`
- **Module**: Product Reviews
- **Authentication Required**: Yes (Bearer Token)
- **Permission**: Authenticated (Customer/Admin/Driver)

### 2. Mục đích
Cho phép khách hàng (User) đã mua hàng để lại nhận xét (Review) và chấm điểm (Rating) cho một sản phẩm cụ thể.

### 3. Khi nào Frontend nên gọi
- Tại trang "Chi tiết sản phẩm", người dùng kéo xuống phần "Đánh giá", điền nội dung và ấn "Gửi".
- Hoặc từ trang lịch sử đơn hàng "Chưa đánh giá".

### 4. Khi nào KHÔNG nên gọi
- Người dùng chưa đăng nhập.
- Chưa điền số sao (Rating = 0).

### 5. Request
- **Path Params**:
  - `id` (number): ID của sản phẩm cần đánh giá.
- **Body**:
  - `rating` (number, **required**): Điểm đánh giá (1, 2, 3, 4, 5).
  - `content` (string, optional): Nội dung đánh giá chữ (Có thể cho phép bỏ trống để chỉ đánh giá sao).

### 6. Business Rule
- Người dùng BẮT BUỘC phải đăng nhập. ID người viết bài sẽ được Backend tự động lấy từ Token.
- Trạng thái mặc định của một Review mới tạo là `is_approved = false` (Tùy thuộc vào chính sách hệ thống, nhưng thường cần Admin duyệt mới cho hiển thị lên trang Public để tránh spam).

### 7. Response
- Trả về đối tượng `ProductReview` mới vừa tạo.

### 9. Frontend Workflow
- Đóng ô nhập liệu.
- Hiển thị Toast thông báo: "Đánh giá của bạn đã được ghi nhận và đang chờ duyệt". (Không cần load lại danh sách đánh giá vì nó chưa được duyệt).

### 13. Side Effect
- **Ghi Database**: Insert bảng `product_reviews`.

---

## 2. GET `/api/v1/products/:id/reviews`

### 1. Tổng quan
- **Tên API**: Lấy danh sách đánh giá sản phẩm (Public)
- **Method**: `GET`
- **Authentication Required**: No

### 2. Mục đích
Hiển thị danh sách các bài Đánh giá và Phản hồi của Shop dưới chân trang Chi tiết sản phẩm.

### 5. Request
- **Query**:
  - `page`, `limit`.

### 6. Business Rule
- BẮT BUỘC CHỈ trả về những bài Đánh giá đã được Duyệt (`is_approved = true`).
- Nếu Admin có trả lời (Reply), thông tin trả lời cũng sẽ được trả về kèm theo.

### 7. Response
- **Response DTO**: Phân trang của `ProductReview`.
- Có Preload `user` (Tên khách hàng đã che ký tự, ví dụ: "Nguyễn V*** A").

---

## 3. PATCH `/api/v1/admin/product-reviews/:id/approve`

### 1. Tổng quan
- **Tên API**: Duyệt đánh giá
- **Method**: `PATCH`
- **Permission**: Admin

### 2. Mục đích
Mở khóa một bài đánh giá để nó xuất hiện trên trang Public.

### 5. Request
- Không cần body. Gọi tới là duyệt.

---

## 4. PATCH `/api/v1/admin/product-reviews/:id/reply`

### 1. Tổng quan
- **Tên API**: Admin trả lời Đánh giá
- **Method**: `PATCH`
- **Permission**: Admin

### 5. Request
- **Body**:
  - `reply` (string, **required**): Dòng văn bản phản hồi của Shop.

### 6. Business Rule
- Gắn nội dung trả lời vào cột `reply` của bảng `product_reviews`.
