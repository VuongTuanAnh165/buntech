# Upload File

Hệ thống hỗ trợ Upload qua thư viện `@adonisjs/drive` (Abstraction storage của AdonisJS).
Dữ liệu hiện tại được lưu ở Local Storage (ổ cứng cục bộ) trong thư mục `storage/images/`.

## API Upload Ảnh

- **URL**: `POST /api/v1/admin/upload`
- **Method**: `POST`
- **Authentication**: `Bearer Token` (yêu cầu Admin).
- **Mục đích**: Tải ảnh (Avatar, Hình ảnh sản phẩm, Banner...) lên server.

## Request

- **Content-Type**: `multipart/form-data`

### Body (Form-Data)

| Key | Loại file cho phép | Dung lượng Max | Yêu cầu |
| --- | --- | --- | --- |
| `image` | `jpg`, `png`, `jpeg`, `webp` | 5MB | Bắt buộc |

## Quá trình xử lý (Business Flow)

1. Validator (`uploadValidator`) kiểm tra dung lượng và định dạng mở rộng (extname).
2. Tạo tên file ngẫu nhiên (UUID) bằng `crypto.randomUUID()` để chống đụng độ và Path Traversal.
3. Chuyển file tới thư mục `storage/images` thông qua Drive disk `fs`.
4. Lấy public URL trả về cho Frontend (ví dụ: `http://localhost:3333/uploads/images/abc-xyz.jpg`).

## Response

**200 OK**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "url": "http://localhost:3333/uploads/images/some-uuid.jpg",
    "path": "images/some-uuid.jpg"
  }
}
```
Client nên lưu `url` hiển thị và lưu `path` để thuận tiện xóa sau này nếu cần.
