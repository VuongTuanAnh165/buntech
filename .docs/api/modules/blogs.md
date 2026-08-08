# Blogs Module

Module này cung cấp các API để quản lý Danh mục bài viết (Blog Categories) và Bài viết (Posts).
Các API được chia làm 2 phần: **Client (Public)** cho người dùng đọc bài, và **Admin** để quản lý nội dung.

---

## 1. Danh mục bài viết (Blog Categories)

### 1.1 Lấy danh sách danh mục (Client & Admin)

- **Module**: Blogs
- **URL**: 
  - Client: `GET /api/v1/blog-categories`
  - Admin: `GET /api/v1/admin/blog-categories`
- **Authentication**: 
  - Client: Public
  - Admin: `Bearer Token` (Role: ADMIN)
- **Mục đích**: Lấy toàn bộ danh sách danh mục bài viết. Không phân trang (do số lượng danh mục thường ít).

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Tin tức",
      "slug": "tin-tuc",
      "description": "Tin tức công nghệ",
      "isActive": true
    }
  ]
}
```

### 1.2 Chi tiết danh mục (Admin)

- **URL**: `GET /api/v1/admin/blog-categories/:id`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Path Params**: `id` (Number)

### 1.3 Tạo mới danh mục (Admin)

- **URL**: `POST /api/v1/admin/blog-categories`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Request Body (JSON)**:
  - `name` (String, required, max 100)
  - `slug` (String, required, max 100, unique)
  - `description` (String, optional, max 191)

### 1.4 Cập nhật danh mục (Admin)

- **URL**: `PUT /api/v1/admin/blog-categories/:id`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Request Body (JSON)**: Tương tự Create nhưng tất cả field là Optional.

### 1.5 Xóa danh mục (Admin)

- **URL**: `DELETE /api/v1/admin/blog-categories/:id`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Business Flow**: Xóa cứng hoặc mềm tùy DB setup (thông qua Service `delete`).

---

## 2. Bài viết (Posts)

### 2.1 Lấy danh sách bài viết

- **Module**: Blogs
- **URL**: 
  - Client: `GET /api/v1/posts`
  - Admin: `GET /api/v1/admin/posts`
- **Authentication**: Client (Public), Admin (`Bearer Token`).
- **Mục đích**: Lấy danh sách bài viết. Client chỉ lấy các bài public (`isPublic = true`), Admin lấy toàn bộ.

#### Query Params
| Query Param | Kiểu | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 10 | Số lượng bài / trang |
| `categoryId` | number | (Tùy chọn) | Lọc theo ID danh mục |

#### Response (200 OK)
Dữ liệu được phân trang theo chuẩn (`data` và `meta` object).

### 2.2 Chi tiết bài viết

- **URL**: 
  - Client: `GET /api/v1/posts/:id`
  - Admin: `GET /api/v1/admin/posts/:id`
- **Path Params**: `id` (Number)
- **Authentication**: Client (Public), Admin (`Bearer Token`). Client API sẽ check `isPublic: true` để tránh rò rỉ bài viết nháp.

### 2.3 Tạo bài viết (Admin)

- **URL**: `POST /api/v1/admin/posts`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Request Body (FormData)**:
  - `title` (String, required, max 191)
  - `slug` (String, required, max 191, unique)
  - `blogCategoryId` (Number, required)
  - `thumbnail` (File, optional, max 5MB, định dạng: jpg, png, jpeg, webp)
  - `content` (String, optional)
  - `metaTitle` (String, optional, max 60)
  - `metaDescription` (String, optional, max 160)
  - `isPublished` (Boolean, optional)
  - `publishedAt` (Date string, optional)
- **Business Flow**: Gắn tự động `authorId` bằng `auth.user.id`. Tạo record mới trong bảng `posts`.

### 2.4 Cập nhật bài viết (Admin)

- **URL**: `PUT /api/v1/admin/posts/:id`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Request Body**: Tương tự Create nhưng tất cả field là Optional.

### 2.5 Xóa bài viết (Admin)

- **URL**: `DELETE /api/v1/admin/posts/:id`
- **Authentication**: `Bearer Token` (Role: ADMIN)
- **Ghi chú**: API gọi Service `delete`. (Controller comments ghi chú: Soft delete).
