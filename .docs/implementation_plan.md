# Phase 5: Chuẩn hóa Swagger Documentation toàn diện (100% API)

Mục tiêu của đợt refactor này là đảm bảo **toàn bộ 23 Controllers** đều có JSDoc chuẩn xác đến từng chi tiết (chuẩn Enterprise), phản ánh chính xác 100% những gì hệ thống đang nhận (Request) và trả về (Response) từ tầng Service.

## User Review Required

Đây là một đợt thay đổi ảnh hưởng tới 23 file Controller và file cấu hình `swagger.ts`. Vui lòng xác nhận phương án tiếp cận này trước khi tôi tiến hành sửa đổi hàng loạt.

## Proposed Changes

Tôi sẽ duyệt qua từng Controller một và thực hiện các công việc sau:

### 1. `config/swagger.ts`
- **[MODIFY]**: Bổ sung tất cả các DTO (Data Transfer Object) Schemas tương ứng với kết quả trả về của các hàm trong `Service`. 
- Ví dụ: Thay vì trả về toàn bộ model `Product` kèm các trường nhạy cảm, Service thường chỉ `.select('id', 'name', 'base_price')` hoặc `.preload('category')`. Tôi sẽ tạo ra các DTO như `<ProductClientList>`, `<ProductAdminShow>`, `<CategoryBasic>` trong `swagger.ts` để hiển thị đúng những trường này.

### 2. Các Controllers (23 files)
- **[MODIFY]**: Cập nhật JSDoc cho từng hàm (method).
  - Thêm `@paramPath` cho các biến trên URL (ví dụ: `id`).
  - Thêm `@paramQuery` cho các tham số phân trang, tìm kiếm (ví dụ: `page`, `limit`, `search`, `status`).
  - Đảm bảo `@requestBody` trỏ tới đúng Validator schema.
  - Cập nhật `@responseBody 200 - <TênDTO>` trỏ tới đúng schema trong `swagger.ts`.

Danh sách các Controller sẽ được xử lý kỹ lưỡng:
1. `AuthController` (Đã tương đối chuẩn, kiểm tra lại)
2. `BlogCategoriesController` (Admin & Client DTOs)
3. `CategoriesController` (Admin & Client DTOs)
4. `CustomerPricesController`
5. `DeviceTokensController`
6. `DriverOrdersController` (Định nghĩa DTO cho Driver)
7. `DriverRoutesController` (Định nghĩa DTO cho Driver Routes)
8. `InventoryController` (Import/Export logs DTOs)
9. `MasterDataController` (Divisions, Sync)
10. `PostsController`
11. `ProductReviewsController`
12. `ProductsController`
13. `PublicOrdersController`
14. `RawMaterialsController`
15. `SystemConfigsController`
16. `TransactionsController`
17. `UploadsController`
18. `UsersController`
19. `AdminOrdersController`

## Verification Plan

### Automated Verification
- Khởi động lại server và truy cập UI Swagger (`http://localhost:3333/docs`).
- Sử dụng công cụ generate output JSON (`curl` hoặc PowerShell REST method) để parse và chắc chắn không có endpoint nào trả về `<Any>` hoặc bị thiếu DTO.
- Kiểm tra các endpoint Client/Admin không rò rỉ dữ liệu thừa.
