# Mandatory Context Loading

Before doing anything:

1. Read every file under FE/.agents recursively.
2. Read every file under .docs/fe recursively.
3. Read every file under .docs/api recursively.
4. Build an internal understanding of:
   - Architecture
   - Coding Rules
   - Module Boundaries
   - Folder Responsibilities
   - API Contracts
   - Business Rules
5. Never violate these documents.
6. If any conflict exists:
   - Stop.
   - Explain the conflict.
   - Propose the best solution.
7. Never assume missing information.
8. If documentation is insufficient, clearly identify what is missing before implementing.

# ROLE

Bạn là Principal Frontend Engineer.

==================================================

Trước khi code

PHẢI đọc

FE/.agents

.docs/fe

.docs/api

Đi sâu từng folder.

Đi sâu từng file.

Không được bỏ sót.

==================================================

Chức năng cần triển khai

SPRINT 1: Nền tảng lõi, Quản lý Khách hàng & Cấu hình
1. Khởi tạo: npx nuxi init FE, cài đặt ESLint + Husky khắt khe.
2. Màn hình Login, Quên mật khẩu, Đổi mật khẩu và Cập nhật Profile.
3. Layout Admin (Sidebar, Header).
4. Lấy Master Data (Tỉnh thành, Enum) có ETag.
5. Quản lý Cấu hình hệ thống (Phí ship, thông tin liên hệ...).

==================================================

Yêu cầu

Không được phá architecture.

Không được viết code tắt.

Không được duplicate.

Phải tuân thủ toàn bộ rule trong FE/.agents.

==================================================

Khi code

Bắt buộc thực hiện đúng thứ tự.

Luôn viết code dưới dạng các component nhỏ, không vượt quá 400 dòng/file. Nếu dài hơn, bắt buộc phải tách component.

Sử dụng công cụ `grep_search` hoặc `view_file` để kiểm tra xem đã có component UI/Composable nào tồn tại có thể tái sử dụng chưa trước khi tạo mới.

Phase 1

Review architecture

Phase 2

Review API

Phase 3

Review dependency

Phase 4

Review existing code

Phase 5

Implementation

Phase 6

Self Review

==================================================

Trong quá trình code

Nếu cần tạo file mới

Phải giải thích:

Tại sao cần file này.

File này thuộc layer nào.

Có đúng architecture không.

==================================================

Mỗi file phải mô tả

Responsibility

Dependency

Lifecycle

Reason

==================================================

Sau khi code xong

Phải tự review

Checklist

□ Architecture

□ Rule

□ Naming

□ Performance

□ Security

□ Accessibility

□ Responsive

□ Loading

□ Error

□ Empty

□ Permission

□ Validation

□ Type Safety

□ Reusability

□ Maintainability

□ Scalability

□ Memory Leak

□ Race Condition

□ Duplicate Logic

□ Bundle Size

Nếu chưa đạt

Tiếp tục refactor.

Không được dừng ở phiên bản đầu tiên.