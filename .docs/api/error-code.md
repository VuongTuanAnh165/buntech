# Danh sách Mã lỗi (Error Codes & Exception Handling)

Tất cả các exception trong hệ thống được gom về xử lý tại `app/exceptions/handler.ts`.
Hệ thống KHÔNG dùng `try/catch` tràn lan trong Controller mà dựa vào Custom Exceptions để format lỗi ra chuẩn.

## Quy tắc Mapping Status Code

| Status Code | Ý nghĩa | Khi nào xảy ra |
| --- | --- | --- |
| **400** | Bad Request | Lỗi BusinessException thông thường, sai logic. |
| **401** | Unauthorized | Token không có, không hợp lệ, hoặc hết hạn. |
| **403** | Forbidden | Token hợp lệ nhưng User không đủ Role/Permission (ví dụ User thường vào Admin API). |
| **404** | Not Found | Lỗi khi tìm bản ghi bằng `findOrFail()` không thấy dữ liệu. |
| **409** | Conflict | Lỗi Database `23505` (PostgreSQL) - Vi phạm Unique Constraint (dữ liệu trùng lặp). |
| **422** | Unprocessable Entity | VineJS validate dữ liệu đầu vào thất bại. |
| **500** | Internal Server Error | Lỗi hệ thống, crash code chưa lường trước. |

## Các Error Code Cụ thể

- `UNIQUE_CONSTRAINT_VIOLATION`: Xảy ra khi Insert/Update dữ liệu vi phạm ràng buộc UNIQUE của Database. (Kèm HTTP `409`).
- `INTERNAL_ERROR`: Xảy ra khi có lỗi chưa bắt được (Kèm HTTP `500`).
- Từng `BusinessException` có thể trả về một `errorCode` tùy chỉnh (VD: `ORDER_NOT_FOUND`, `INSUFFICIENT_STOCK`). Sẽ được liệt kê chi tiết trong từng mô-đun API.
