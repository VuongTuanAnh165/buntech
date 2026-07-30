# Báo cáo Phân tích Kỹ thuật và Đánh giá (Audit Report) - Frontend

**Dự án:** Chuyển đổi số Xưởng Bún BunTech
**Vai trò phân tích:** Senior System Analyst & Tech Lead
**Tài liệu tham chiếu:** `.docs/required_chung.md` và `.docs/api/*` (Bao gồm các thống nhất chốt chặn nghiệp vụ giữa BA, BE, FE).

---

## 1. Tóm tắt hệ thống
BunTech là hệ thống phần mềm chuyển đổi số toàn diện cho xưởng bún gia đình, tập trung số hóa quy trình từ Marketing, Đặt hàng sỉ/lẻ, Điều phối giao nhận, cho đến Quản lý công nợ và Tồn kho. Hệ thống xây dựng trên kiến trúc Client-Server với Backend sử dụng AdonisJs 7 (PostgreSQL), cung cấp API cho 3 phân hệ Frontend: Web Admin (Nuxt.js), Mobile App Tài xế (Capacitor) và Kênh đặt hàng cho khách (Web Form).

## 2. Mục tiêu hệ thống
- Tối ưu hóa lợi nhuận, giảm thất thoát (qua quản lý hao hụt nguyên liệu chặt chẽ và hạch toán công nợ tự động).
- Tự động hóa quy trình quản lý bán hàng thủ công, giảm tải cho chủ xưởng.
- Tăng cường nhận diện thương hiệu và tiếp cận khách hàng mới qua nền tảng Web chuẩn SEO.

## 3. Các module nghiệp vụ
- **Authentication & User Profile**: Định danh, hồ sơ khách hàng và sổ địa chỉ.
- **Product & Custom Price**: Danh mục, sản phẩm và bảng giá sỉ linh hoạt cho từng khách hàng.
- **Order & Routing**: Tiếp nhận, duyệt đơn, gom đơn (Batch Assign) và phân tuyến giao hàng.
- **Delivery (Driver)**: App nội bộ để chốt giao hàng tận nơi, nhập tiền thực thu, tự động tính toán công nợ và trừ kho.
- **Finance**: Sổ cái giao dịch, quản lý thanh toán nợ khách hàng.
- **Inventory (Kho)**: Nhập/Xuất kho nguyên vật liệu và báo cáo tỷ lệ hao hụt.
- **CMS & Marketing**: Quản lý Blog bài viết và thông tin trang chủ SEO.
- **Dashboard**: Thống kê số liệu doanh thu (kèm biểu đồ) và Top Buyers.

## 4. Actor
1. **Chủ xưởng (Admin)**: Toàn quyền kiểm soát và vận hành hệ thống.
2. **Tài xế (Driver)**: Sử dụng App nội bộ xem tuyến đường và chốt giao hàng.
3. **Khách hàng Sỉ (Customer)**: Truy cập hệ thống để đặt hàng, có tài khoản định danh, có công nợ, được hưởng mức giá riêng.
4. **Khách vãng lai (Guest)**: Truy cập trang chủ, xem tin tức, đặt đơn nhanh.
5. **Bot spam**: Bị hệ thống chặn tự động qua Honeypot.

## 5. Business Flow
1. **Đặt đơn**: Khách sỉ đăng nhập $\rightarrow$ Đặt đơn (hệ thống tự áp Custom Price) $\rightarrow$ Admin duyệt. Khách vãng lai gửi đơn nhanh (có check Honeypot).
2. **Giao hàng & Chốt đơn**: Admin gom đơn (Batch Assign) $\rightarrow$ Bắn Push Notification cho Tài xế $\rightarrow$ Tài xế đi giao $\rightarrow$ Bấm chốt `DELIVERED`, nhập tiền thu thực tế (`amountCollected`).
3. **Kế toán & Kho tự động**: Đơn giao thành công $\rightarrow$ BE tự động tính (`Debt = Tổng Bill - amountCollected`) $\rightarrow$ Cộng dồn vào công nợ khách hàng $\rightarrow$ Sinh Sổ cái Transaction. Đồng thời, tự động trừ bún thành phẩm khỏi kho thực tế.
4. **Quản lý hao hụt**: Nhập gạo (Import), Xuất gạo (Export) $\rightarrow$ Đối chiếu lượng gạo xuất so với bún bán ra $\rightarrow$ Sinh Báo cáo Tỷ lệ hao hụt.

## 6. Các quy trình
- Quy trình lấy Master Data tối ưu băng thông (ETag/304).
- Quy trình cài đặt mức giá riêng cố định cho từng khách sỉ.
- Quy trình vạch lộ trình tài xế hàng ngày (Routing).
- Quy trình kiểm soát giao nhận chống Duplicate (Idempotency Key).
- Quy trình kiểm kê nhập/xuất Kho và tính hao hụt tự động.

## 7. Các trạng thái dữ liệu
- **OrderStatus**: PENDING, PROCESSING, SHIPPING, DELIVERED, CANCELLED.
- **Role**: ADMIN, DRIVER, CUSTOMER.
- **TransactionType**: PAYMENT, REFUND, DEBT_INCREASE, DEBT_PAYMENT.
- **Product Review**: isApproved (True/False).

## 8. Rule nghiệp vụ
- Khách sỉ mua hàng được ưu tiên lấy giá trong **Bảng giá riêng**. Ở Phase 1, chỉ áp dụng 1 mức giá cố định/khách, không làm giá bậc thang (Tier-pricing).
- Đặt hàng nhanh bắt buộc rỗng trường `website_url` (Honeypot).
- Gửi Zalo ZNS tự động được BE chạy ngầm dựa vào số điện thoại (ZOA), FE không cần tích hợp.
- Một địa chỉ thiết lập `isDefault: true` sẽ tự động tháo `isDefault` ở các địa chỉ còn lại.
- Dữ liệu bị xóa áp dụng Soft-delete (Kho, Sản phẩm, Bài viết).

## 9. Validation nghiệp vụ
- Số điện thoại tuân thủ format Mobile 10-11 số.
- Mật khẩu thiết lập ít nhất 6 ký tự.
- Chống lặp lệnh (Double-click) ở app Tài xế bắt buộc dùng `idempotencyKey` (UUIDv4).
- Tham số `amountCollected`: Truyền `0` nếu ghi nợ 100%, truyền bằng tổng bill nếu trả đủ.

## 10. Phân quyền
- **Opaque Access Token** (kèm Refresh Token để duy trì đăng nhập dài ngày).
- `middleware.admin()`: Prefix `/api/v1/admin/*`.
- `middleware.driver()`: Prefix `/api/v1/driver/*`.
- `middleware.silentAuth()`: Cho các route public (ngầm check token để hiển thị profile nếu có).

## 11. Luồng dữ liệu
- Giao tiếp hoàn toàn qua chuẩn JSON RESTful.
- Push Notification: FCM/APNS được lưu xuống Backend để nhận phân công.
- Master Data lưu trên trình duyệt (Cache-Control, ETag), chỉ request nội dung khi hash version từ Backend thay đổi.

## 12. Mapping giữa Business và API
- *Xử lý nghiệp vụ Đơn hàng & Công nợ* $\rightarrow$ **Orders + Finance Module**
- *Khởi tạo lõi khách hàng* $\rightarrow$ **Users + Master Data Module**
- *Giao hàng với Mobile App* $\rightarrow$ **Driver Module**
- *Tự động hóa Quản lý Kho* $\rightarrow$ **Inventory Module**
- *SEO & Marketing* $\rightarrow$ **Blogs + Products Module**
- *Thống kê* $\rightarrow$ **Dashboard Module**

---

## 13. API nào chưa đủ
- **Mô tả**: Chức năng "Copy đơn ngày hôm qua" không có API clone chuyên biệt.
- **Ảnh hưởng**: FE phải code logic nhiều hơn.
- **Mức độ**: Low
- **Đề xuất**: (Đã chốt) FE tự xử lý hoàn toàn ở Client: Gọi lấy chi tiết đơn cũ $\rightarrow$ Parse dữ liệu $\rightarrow$ Fill vào Form $\rightarrow$ Cho phép chỉnh sửa $\rightarrow$ Bấm tạo mới. Giảm tải cho BE.

## 14. API nào dư
- **Mô tả**: Route xuất đơn hàng lỗi thời `GET /api/v1/admin/exports/orders`.
- **Ảnh hưởng**: Gây nhiễu router và tài liệu.
- **Mức độ**: Low
- **Đề xuất**: (Đã chốt) BE tiến hành gỡ bỏ. FE thống nhất chỉ gọi `exports/orders-today`.

## 15. Business nào chưa có API
- **Mô tả**: Tích hợp gửi Zalo ZNS.
- **Ảnh hưởng**: Không có document API Zalo cho FE gọi.
- **Mức độ**: Low
- **Đề xuất**: (Đã chốt) BE tự động chạy ngầm qua Queue/Cronjob nội bộ. FE không cần quan tâm đến API Zalo hay SDK bên thứ 3. Giao diện FE chỉ cần form nhập Số điện thoại.

## 16. API nào không thấy sử dụng
- **Mô tả**: Không có thông tin trong tài liệu về việc có tính năng nào không sử dụng. Trước đó có đề xuất bỏ Product Reviews nhưng Product Owner đã yêu cầu giữ lại.
- **Ảnh hưởng**: FE phải implement đầy đủ chức năng Đánh giá sản phẩm.
- **Mức độ**: Medium
- **Đề xuất**: (Đã chốt) Bổ sung màn hình đánh giá ở Client, và màn hình quản lý duyệt/trả lời đánh giá ở Admin.

## 17. Những điểm mâu thuẫn giữa required và API
- **Mô tả**: Mâu thuẫn giữa nghiệp vụ Copy Đơn (Nhanh) và API khởi tạo mảng items mới tinh.
- **Ảnh hưởng**: Khác biệt tư duy triển khai.
- **Mức độ**: Low
- **Đề xuất**: (Đã chốt) Chấp nhận mâu thuẫn này để tăng tính linh hoạt. FE sẽ làm cầu nối (Adapter) xử lý Data Transformation.

## 18. Những điểm khó hiểu
- **Mô tả**: Việc hạch toán tự động ở Driver App (amountCollected) và trừ kho.
- **Ảnh hưởng**: Dễ dẫn đến sai lệch sổ sách nếu hiểu nhầm.
- **Mức độ**: Medium
- **Đề xuất**: (Đã chốt trong document) FE hiểu rõ quy tắc truyền `amountCollected`. Không gọi thêm bất cứ API ghi nợ hay trừ kho nào khác. Giao khoán hoàn toàn tính toán Transaction cho BE Database Transaction.

## 19. Những điểm cần hỏi BE
- **Mô tả**: Các chốt chặn kỹ thuật cần xác nhận giữa các team.
- **Ảnh hưởng**: Chặn đứng tiến độ phát triển FE.
- **Mức độ**: Low (Đã được xử lý 100%)
- **Đề xuất**: Toàn bộ các vấn đề (Giá bán sỉ 1 bậc, ZOA Zalo bằng SĐT) đã được giải đáp thỏa đáng ở Biên bản họp (Sign-off). Không còn câu hỏi tồn đọng.

## 20. Những tài liệu còn thiếu
- **Mô tả**: Schema JSON Response chi tiết dạng tĩnh để FE sinh TypeScript Interface.
- **Ảnh hưởng**: Thiếu file để Generator hoạt động.
- **Mức độ**: High
- **Đề xuất**: (Đã chốt) BE sẽ cấp link Swagger UI (`/docs`) và file Postman Collection v2.1 export tự động bằng thư viện `@adonisjs/swagger`. FE sẽ import và sinh types.

## 21. Những nghiệp vụ còn thiếu
- **Mô tả**: Không có thông tin trong tài liệu về luồng OAuth Zalo rườm rà.
- **Ảnh hưởng**: Giảm tải khối lượng công việc.
- **Mức độ**: Low
- **Đề xuất**: (Đã chốt) Dùng thẳng Phone Number (ZOA) để gửi ZNS. Bỏ qua luồng OAuth.

## 22. Những rủi ro khi FE triển khai
- **Mô tả**: Rủi ro liên quan đến Cache 304, Spam Bot, và Trùng đơn.
- **Ảnh hưởng**: Chập chờn dữ liệu hoặc bị tấn công DDOS.
- **Mức độ**: High
- **Đề xuất**: (Đã chốt cách xử lý)
  1. **Idempotency Key & Offline-first**: FE viết Hook sinh UUIDv4. Nếu rớt mạng, lưu vào **idb-keyval (Offline Queue)** và đồng bộ sau thay vì chỉ báo lỗi.
  2. **Honeypot**: Dùng CSS ẩn field `website_url` (`opacity: 0`, `position: absolute`).
  3. **ETag**: Test kỹ thư viện Fetch trên Capacitor kẹp `If-None-Match`. BE trả 304 load cực nhanh.
  4. **Optimistic Locking**: FE kẹp `updatedAt` khi đổi trạng thái đơn để BE check khóa chống ghi đè (409 Conflict).
  5. **Realtime**: Sử dụng **SSE (Server-Sent Events)** ở màn hình danh sách Admin thay vì dùng Polling tốn tài nguyên.

## 23. Những nghiệp vụ/Màn hình bỏ quên (Đã bổ sung)
- **Mô tả**: Quên luồng Quên mật khẩu, xem hồ sơ cá nhân và đổi mật khẩu cho Admin. Trải nghiệm chạm nhầm của tài xế.
- **Ảnh hưởng**: Admin bị khóa tài khoản không có cách lấy lại. Tài xế cấn túi quần chốt nhầm đơn.
- **Mức độ**: High
- **Đề xuất**: 
  - Đã bổ sung màn hình `Quên mật khẩu`, `Đổi mật khẩu` vào danh sách.
  - Áp dụng UX **"Swipe to Confirm" (Kéo trượt để chốt đơn)** cho App Tài xế.
