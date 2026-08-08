# Products Module

Module này chịu trách nhiệm quản lý Danh mục sản phẩm (Categories), Sản phẩm (Products) và Đánh giá (Reviews).

---

## 1. Danh mục sản phẩm (Categories)

### 1.1 Lấy danh sách danh mục

- **Module**: Products
- **URL**: 
  - Client: `GET /api/v1/categories` (Lấy mảng toàn bộ danh mục)
  - Admin: `GET /api/v1/admin/categories` (Có phân trang)
- **Authentication**: Client (Public), Admin (`Bearer Token`).

### 1.2 Các API Admin cho Danh mục
- **Tạo danh mục**: `POST /api/v1/admin/categories`
  - **Request Body (FormData)**:
    - `name` (String, required, max 100)
    - `slug` (String, required, max 100, unique)
    - `description` (String, optional)
    - `metaTitle` (String, optional, max 60)
    - `metaDescription` (String, optional, max 160)
    - `thumbnail` (File, optional, max 2MB, định dạng: jpg, png, jpeg, webp)
- **Cập nhật**: `PUT /api/v1/admin/categories/:id`
  - **Request Body**: Tương tự như Create, nhưng tất cả các field đều là Optional.
- **Chi tiết**: `GET /api/v1/admin/categories/:id` (Và client `GET /api/v1/categories/:id`)
- **Xóa**: `DELETE /api/v1/admin/categories/:id`

*(Tất cả API Admin đều yêu cầu quyền `ADMIN`).*

---

## 2. Sản phẩm (Products)

### 2.1 Lấy danh sách sản phẩm

- **URL**:
  - Client: `GET /api/v1/products`
  - Admin: `GET /api/v1/admin/products`
- **Query Params**:
  - `page`: Trang hiện tại
  - `limit`: Số bản ghi mỗi trang
  - `categoryId`: Lọc theo ID danh mục
- **Authentication**: Client (Public), Admin (`Bearer Token`). Client Service sẽ tự động loại bỏ các sản phẩm đã ẩn hoặc hết hàng (tùy nghiệp vụ).

### 2.2 Các API Admin cho Sản phẩm
- **Tạo sản phẩm**: `POST /api/v1/admin/products`
  - **Request Body (FormData)**:
    - `categoryId` (Number, optional)
    - `name` (String, required, max 191)
    - `slug` (String, required, max 191, unique)
    - `basePrice` (Number, required, min 0)
    - `unit` (String, required, max 20)
    - `shortDescription` (String, optional)
    - `content` (String, optional)
    - `metaTitle` (String, optional, max 60)
    - `metaDescription` (String, optional, max 160)
    - `isActive` (Boolean, optional)
    - `thumbnail` (File, optional, max 2MB, định dạng: jpg, png, jpeg, webp)
    - `images` (Array of Files, optional, tối đa 2MB/file)
- **Cập nhật**: `PUT /api/v1/admin/products/:id`
  - **Request Body (FormData)**: Tất cả field như Create nhưng là Optional. Hỗ trợ thêm các field cho Gallery:
    - `deletedImageIds` (Array of Numbers, optional): Mảng ID của các ảnh cần xóa.
    - `imageOrders` (Array of Object `[{id, order}]`, optional): Mảng cập nhật thứ tự hiển thị của ảnh (được parse tự động từ chuỗi JSON nếu gửi qua form-data).
- **Chi tiết**: `GET /api/v1/admin/products/:id` (Và client `GET /api/v1/products/:id`)
- **Xóa**: `DELETE /api/v1/admin/products/:id` (Hỗ trợ Soft Delete).

---

## 3. Đánh giá sản phẩm (Product Reviews)

Quản lý review của khách hàng trên sản phẩm. Hệ thống có cơ chế kiểm duyệt (Approve) từ Admin.

### 3.1 Client xem và gửi đánh giá

- **Xem đánh giá**: `GET /api/v1/products/:id/reviews`
  - Public API, trả về các đánh giá đã được duyệt (`isApproved: true`). Có hỗ trợ phân trang.
- **Gửi đánh giá**: `POST /api/v1/products/:id/reviews`
  - **Auth**: Yêu cầu Đăng nhập (`Bearer Token`).
  - **Request Body (FormData)**: 
    - `rating` (Number, required, min 1, max 5)
    - `content` (String, optional, max 1000)
    - `images` (Array of Files, optional, tối đa 5 file, max 5MB/file, định dạng: jpg, png, jpeg, webp)
  - **Lưu ý**: Đánh giá tạo ra mặc định sẽ có trạng thái `isApproved: false` và đợi duyệt.

### 3.2 Admin Quản lý đánh giá

- **Lấy danh sách tất cả đánh giá**: `GET /api/v1/admin/product-reviews` (Có phân trang, xem được cả chưa duyệt).
- **Duyệt / Ẩn đánh giá**: `PATCH /api/v1/admin/product-reviews/:id/approve`
  - **Request Body (JSON)**:
    - `isApproved` (Boolean, required)
- **Admin trả lời**: `PATCH /api/v1/admin/product-reviews/:id/reply`
  - **Request Body (JSON)**:
    - `replyContent` (String, required, max 2000)
  - Tự động lưu `adminId` của người duyệt/trả lời.
- **Xóa đánh giá**: `DELETE /api/v1/admin/product-reviews/:id`
