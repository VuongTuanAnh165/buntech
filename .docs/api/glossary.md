# Thuật ngữ (Glossary)

- **Opaque Token**: Token định danh ngẫu nhiên (không phải JWT), bắt buộc phải truy vấn Database để xác thực.
- **Transaction**: Luồng xử lý nguyên tử của CSDL. Nếu có lỗi, tất cả thay đổi trong luồng sẽ tự động Undo (Rollback).
- **Soft Delete**: Xóa mềm, đánh dấu cờ deleted_at chứ không xóa vật lý record khỏi Database.
- **Idempotency Key**: Mã định danh thao tác độc nhất do Client sinh ra, giúp chống trùng lặp dữ liệu khi gửi request nhiều lần.
