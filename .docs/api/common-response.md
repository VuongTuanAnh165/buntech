# Cấu trúc Response Chung (Common Response)

Hệ thống tuân thủ nghiêm ngặt định dạng trả về JSON đồng nhất cho mọi API (thông qua Middleware và Error Handler).

## 1. Trả về Thành công (Success Response)

Mọi API thành công thường trả về HTTP Status Code `200 OK` hoặc `201 Created`, với format:

```json
{
  "success": true,
  "message": "Thông báo thân thiện với người dùng",
  "data": { ... } // hoặc mảng [...]
}
```

- **`success`** `(boolean)`: Luôn là `true` khi request thành công.
- **`message`** `(string)`: Lời nhắn (có thể hiển thị trực tiếp lên UI như toast/alert).
- **`data`** `(object | array | null)`: Payload chứa dữ liệu chính của response.

## 2. Trả về Lỗi (Error Response)

Mọi lỗi trả về cũng tuân theo format chuẩn từ `app/exceptions/handler.ts`. 
Status Code có thể là `400`, `401`, `403`, `404`, `409`, `422`, `500`.

### Lỗi Nghiệp vụ / Hệ thống (Business Error)

```json
{
  "success": false,
  "message": "Chi tiết lỗi nghiệp vụ...",
  "errorCode": "OPTIONAL_ERROR_CODE"
}
```

### Lỗi Validation (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "field_name_1": ["Lỗi 1", "Lỗi 2"],
    "field_name_2": ["Lỗi 1"]
  }
}
```

- `errors` là một object với key là tên trường dữ liệu bị lỗi, value là mảng các câu thông báo lỗi chi tiết.
