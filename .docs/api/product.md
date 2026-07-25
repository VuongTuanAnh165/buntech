# Product Module API Specification

Tài liệu này mô tả chi tiết các API quản lý Sản phẩm dành cho Admin và Client (Public).

---

## 1. POST `/api/v1/admin/products`

### 1. Tổng quan
- **Tên API**: Tạo mới Sản phẩm
- **URL**: `/api/v1/admin/products`
- **Method**: `POST`
- **Module**: Products
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Tạo sản phẩm mới, upload ảnh thumbnail và thư viện ảnh (gallery).

### 5. Request
- **Headers**: `Content-Type: multipart/form-data` (BẮT BUỘC, vì chứa file ảnh).
- **Body** (Form Data):
  - `name` (string, **required**): Tên sản phẩm.
  - `basePrice` (number, **required**): Giá gốc.
  - `unit` (string, **required**): Đơn vị tính (VD: `kg`, `hộp`).
  - `categoryId` (number, **required**): Nằm trong danh mục nào.
  - `shortDescription` (string, optional): Mô tả ngắn.
  - `content` (string, optional): Nội dung chi tiết (HTML).
  - `isActive` (boolean, default `true`): Trạng thái hiển thị.
  - `thumbnail` (File, optional): Ảnh đại diện.
  - `images` (Array<File>, optional): Nhiều ảnh thư viện đính kèm.

**Field Explanation**:
- Phải dùng FormData API ở JS/TS để gửi. `images` gửi dưới dạng mảng `images[]`.

### 6. Business Rule
- BE sẽ bóc tách File và Upload lên ổ đĩa cứng (S3/Drive) trước.
- Sau khi upload xong lấy URL mới insert record Product và ProductImages vào CSDL (Transaction).
- Lỗi DB thì ảnh rác trên đĩa sẽ bị rollback xóa đi.

### 8. Error Handling
- `413 Payload Too Large`: Ảnh quá nặng. (Quy định < 5MB).
- `422 Unprocessable Entity`: Form data không đúng.

### 9. Frontend Workflow
- Reset trắng Form tạo sản phẩm nếu gọi thành công. Hoặc chuyển trang về `/admin/products`.

---

## 2. PUT `/api/v1/admin/products/:id`

### 1. Tổng quan
- **Tên API**: Cập nhật Sản phẩm
- **Method**: `PUT` (sử dụng Form Data)

### 5. Request
- **Body** (Form Data): 
  - Khác với Tạo mới, cập nhật cho phép truyền thêm các field:
  - `deletedImageIds` (Array<number>, optional): Mảng ID của các ảnh gallery cũ muốn XÓA.
  - `imageOrders` (Array<{id, order}>, JSON string): Thứ tự sắp xếp lại của ảnh. FE nên `JSON.stringify` mảng này trước khi nhét vào FormData.

### 6. Business Rule
- Backend sẽ so khớp và tự động xóa ảnh cũ trên đĩa vật lý (nếu Client đổi `thumbnail` hoặc xóa ảnh trong gallery bằng `deletedImageIds`).
- Thứ tự ảnh được cập nhật đồng loạt.

### 9. Frontend Workflow
- Cập nhật lại UI, không cần reload toàn bộ trang.

---

## 3. GET `/api/v1/products` (Client)

### 1. Tổng quan
- **Tên API**: Lấy danh sách Sản phẩm hiển thị Public
- **URL**: `/api/v1/products`
- **Method**: `GET`
- **Authentication Required**: No

### 5. Request
- **Query**: `page`, `limit`, `categoryId` (để lọc theo tab danh mục).

### 6. Business Rule
- Backend CHỈ trả về sản phẩm có `isActive = true`.

### 7. Response
- Trả về danh sách Pagination. Chú ý field `basePrice` là kiểu chuỗi (String). FE tự ép sang Number để fomat VND.
- Đã được Preload sẵn Object `category` bên trong để dễ hiển thị breadcrumb/tag.

### 11. Cache Strategy *(Recommended Practice)*
- **Stale-While-Revalidate (SWR)**: API này nên được cache mạnh mẽ từ Frontend, vì sản phẩm ít khi thay đổi liên tục. Cài đặt staleTime khoảng 1-5 phút.

---

## 4. GET `/api/v1/products/:id` (Client)

### 1. Tổng quan
- **Tên API**: Chi tiết Sản phẩm Public
- **URL**: `/api/v1/products/:id`
- **Method**: `GET`
- **Authentication Required**: No

### 6. Business Rule
- Nếu truy cập Sản phẩm đang bị `isActive = false`, BE ném lỗi `404 Not Found`.

### 7. Response
- Trả về Full đối tượng Product.
- Preload sẵn mảng `images` (Gallery) đã được order theo `display_order`. Trình tự ảnh rất quan trọng cho Carousel/Slider của FE.

### 9. Frontend Workflow
- Đổ dữ liệu HTML vào thẻ hiển thị `content` một cách an toàn (VD: `<div dangerouslySetInnerHTML />` trong React, lưu ý XSS).

---

## 5. Các API Quản lý Danh mục (Categories)

### 1. Tổng quan
- Danh mục sản phẩm (Categories) là Module đi kèm và không thể thiếu của Products.

### 2. Endpoints
- **Public Client**:
  - `GET /api/v1/categories`: Lấy danh sách danh mục public (dùng để render menu/tab).
  - `GET /api/v1/categories/:id`: Lấy thông tin chi tiết của một danh mục.
- **Admin**:
  - `GET /api/v1/admin/categories`: Lấy danh sách quản trị.
  - `GET /api/v1/admin/categories/:id`: Xem chi tiết danh mục.
  - `POST /api/v1/admin/categories`: Tạo mới.
  - `PUT /api/v1/admin/categories/:id`: Cập nhật.
  - `DELETE /api/v1/admin/categories/:id`: Xóa danh mục.
- **Permission**: 
  - Các API `/api/v1/categories` là **Public**.
  - Các API `/api/v1/admin/categories` yêu cầu **Admin**.

### 3. Business Rule
- Xóa danh mục (DELETE) chỉ khả dụng nếu danh mục đó không có sản phẩm nào bên trong. Ngược lại, BE sẽ báo lỗi `400 Bad Request`.
