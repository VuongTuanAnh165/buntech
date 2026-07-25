# Blog Module API Specification

Tài liệu này hướng dẫn lấy và cập nhật bài viết Tin tức / Kiến thức để phục vụ SEO Website.

---

## 1. GET `/api/v1/posts` (Public Client)

### 1. Tổng quan
- **Tên API**: Lấy danh sách Bài viết Public
- **Method**: `GET`
- **Permission**: Public

### 2. Mục đích
Hiển thị danh sách các bài Blog mới nhất trên trang chủ hoặc trang Tin tức.

### 5. Request
- **Query**:
  - `page`, `limit`.
  - `blogCategoryId` (optional): Lọc theo chuyên mục cụ thể.
  - `isFeatured` (optional): Lọc các bài viết được tick làm nổi bật.

### 6. Business Rule
- Chỉ trả về bài viết có `is_published = true`. 
- Danh sách trả về không chứa toàn bộ trường HTML `content` để tối ưu kích thước payload mạng, mà chỉ chứa trường `excerpt` (tóm tắt).
- Preload danh mục Blog tương ứng.

### 11. Cache Strategy *(Recommended Practice)*
- **SSG hoặc ISR**: Vì đây là nội dung phục vụ Google Bot SEO. Hãy Render tĩnh phía Server nếu dùng Next.js. Không nên phụ thuộc hoàn toàn vào CSR (Client Side Rendering).

---

## 2. GET `/api/v1/posts/:id` (Public Client)

### 1. Tổng quan
- **Tên API**: Chi tiết bài viết Public bằng ID
- **Method**: `GET`

### 2. Mục đích
Đọc chi tiết một bài viết cụ thể thông qua đường dẫn thân thiện với SEO (VD: `/bai-viet/huong-dan-nuoi-ca`).

### 5. Request
- **Path Params**:
  - `id` (number): Bắt buộc.

### 7. Response
- Có chứa trường `content` dạng HTML.
- **Side Effect**: Khi FE gọi API này, Backend có thể cộng dồn trường `view_count` thêm +1 (nếu BE thiết kế tính view). 

### 9. Frontend Workflow
- Bơm HTML vào trong thẻ hiển thị an toàn (VD: `dangerouslySetInnerHTML`).
- Set thẻ `<title>` và `<meta description>` của Website dựa trên các trường `metaTitle` và `metaDescription` đi kèm theo bài viết để tối ưu On-Page SEO.

---

## 3. Các API Quản trị Admin
(`POST /api/v1/admin/posts`, `PUT /api/v1/admin/posts/:id`, `DELETE /api/v1/admin/posts/:id`)

- **Thao tác**: Tạo, Cập nhật, và Xóa Bài viết. 
- **Request**: Quá trình tạo bài viết giống hệt Tạo Sản Phẩm (Tạo Form Data chứa ảnh `thumbnail` làm ảnh bìa).
- Các ảnh chèn bên Trog phần thân `content` (HTML) phải được upload rời rạc thông qua **Upload Module** trước, lấy link nhét vào thẻ `<img/>` của TinyMCE.

---

## 4. Các API Chuyên mục Blog (Blog Categories)

### 1. Tổng quan
- **Module**: Blog Categories
- Cung cấp tính năng phân loại bài viết.

### 2. Endpoints
- **Public Client**:
  - `GET /api/v1/blog-categories`: Lấy danh sách chuyên mục (Phục vụ bộ lọc bài viết ở Frontend).
- **Admin**:
  - `GET /api/v1/admin/blog-categories`: Lấy danh sách.
  - `GET /api/v1/admin/blog-categories/:id`: Xem chi tiết.
  - `POST /api/v1/admin/blog-categories`: Tạo chuyên mục mới.
  - `PUT /api/v1/admin/blog-categories/:id`: Cập nhật.
  - `DELETE /api/v1/admin/blog-categories/:id`: Xóa.
- **Permission**:
  - Các API Public: **Public**.
  - Các API Admin: **Admin**.
