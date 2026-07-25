# Upload Module API Specification

Tài liệu này mô tả dịch vụ lưu trữ và truyền tải tệp tĩnh (File Server) dùng chung trên toàn ứng dụng.

---

## 1. POST `/api/v1/admin/upload`

### 1. Tổng quan
- **Tên API**: Dịch vụ Upload File trung tâm
- **Method**: `POST`
- **Module**: Uploads
- **Permission**: Admin
- **Middleware**: `auth`, `admin`

### 2. Mục đích
Nền tảng này không lưu ảnh dạng Base64 vào CSDL mà sử dụng ổ đĩa tĩnh. API này nhận File tải lên (ảnh), ghi xuống đĩa, và trả về đường dẫn URL an toàn để Frontend chèn vào các Form dữ liệu khác (như Tạo Sản phẩm, Đổi Avatar, Soạn Blog HTML).

### 3. Khi nào Frontend nên gọi
- Khi người dùng chọn Ảnh trên trình duyệt và API thực tế (như Update Profile) chỉ nhận tham số String URL (chứ không nhận FormData trực tiếp). Lúc này Frontend gọi Upload ngầm trước, lấy URL rồi mới Submit form chính.
- Plugin của Trình soạn thảo văn bản (Rich Text Editor như TinyMCE, Quill) gọi API này khi người dùng paste ảnh vào khung soạn thảo.

### 5. Request
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `file` (File object, **required**): Đối tượng Blob/File từ thẻ `<input type="file" />`.

**Field Explanation**:
- AdonisJS Backend sẽ thiết lập giới hạn cấu hình (ví dụ max size = 5MB, format: jpg, png, webp, jpeg).

### 6. Business Rule
- Ghi trực tiếp xuống hệ thống lưu trữ tĩnh (`Drive` của Adonis).
- Tạo ra 1 chuỗi Tên ngẫu nhiên cực mạnh (UUID hoặc Timestamp hash) để chống trùng tên file.
- Không chạm vào Database. (Tức là không có Transaction DB).

### 7. Response
- **Body**:
```json
{
  "url": "http://localhost:3333/uploads/products/image123.webp",
  "key": "products/image123.webp"
}
```

**Field Explanation**:
- `url`: Link HTTP(S) tuyệt đối. Dùng để nhét vào thẻ `<img src="..." />` hiển thị ra giao diện.
- `key`: Định danh tương đối lưu trên ổ cứng. (FE có thể không cần xài key này, BE sẽ xài ngầm khi cần xóa).

### 8. Error Handling
- `413 Payload Too Large`: Dung lượng file vượt giới hạn quy định.
  - *FE xử lý*: Báo lỗi ngay cho người dùng "Kích thước ảnh tối đa 5MB".
- `422 Unprocessable Entity`: Định dạng file bị từ chối (Chặn tải lên .exe, .sh, .bat).

### 9. Frontend Workflow
- Bắt lấy URL. Đổ URL đó vào state của React/Vue.
- Thay thế ảnh Thumbnail trên UI thành ảnh mới.

### 10. Loading Strategy *(Recommended Practice)*
- Hiển thị thanh Progress Bar dựa vào event `onUploadProgress` của Axios. (Rất hữu ích với 3G, 4G).

### 16. Best Practice
- **Nén ảnh trước khi up**: Frontend nên sử dụng thư viện như `browser-image-compression` để nén ảnh (ví dụ 10MB xuống 500KB) TRƯỚC KHI bắn qua API này. Điều này tiết kiệm băng thông và tăng tốc độ UX cực kỳ lớn.
