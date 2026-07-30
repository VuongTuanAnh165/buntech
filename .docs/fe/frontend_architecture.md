# Kiến Trúc Frontend Toàn Diện - Dự án BunTech

**Tác giả:** Senior Frontend Architect
**Nền tảng:** Web Admin & Customer Site (Nuxt.js + Vue 3 + TailwindCSS), Mobile App Tài xế (Capacitor + Vue 3)
**Trạng thái:** DRAFT / REVIEWING

---

## 1. Danh sách Module (Modules)
Kiến trúc Frontend chia thành 3 App (ứng dụng) logic nhưng có thể dùng chung Monorepo hoặc chia 2 Repo (Nuxt Web + Capacitor App):
- **Core/Shared Module**: Auth, Axios Interceptors, Pinia Store, Components chung, Master Data (tỉnh thành, constants).
- **Web Admin Module**: Quản trị viên (Users, Products, Orders, Finance, Inventory, Blog, Dashboard).
- **Driver App Module**: App Tài xế (Today Route, Đổi trạng thái đơn, Thu tiền mặt).
- **Customer Site Module**: Giao diện Khách hàng (Landing Page SEO, Xem sản phẩm, Zalo Quick Order, Xem công nợ cá nhân).

## 2. Danh sách Màn hình (Screens)
**2.1 Web Admin (Nuxt)**
- `[Auth]` Đăng nhập, Quên mật khẩu, Đặt lại mật khẩu.
- `[Profile]` Xem hồ sơ cá nhân, Đổi mật khẩu cá nhân.
- `[Dashboard]` Tổng quan & Biểu đồ, Top Khách hàng.
- `[Users]` Danh sách khách hàng, Chi tiết khách (gồm Tab: Lịch sử Đơn, Công nợ, Sổ địa chỉ, Bảng giá riêng).
- `[Products]` Danh mục, Danh sách sản phẩm, Thêm/Sửa sản phẩm, Quản lý Đánh giá (Reviews).
- `[Orders]` Danh sách đơn hàng, Form tạo đơn (tự động map giá riêng của khách), Chi tiết đơn, Màn hình điều phối (Batch Assign).
- `[Finance]` Sổ cái giao dịch (Transactions), Thanh toán nợ (Pay Debt).
- `[Inventory]` Tồn kho, Nhập kho, Xuất kho, Báo cáo hao hụt (Loss Report).
- `[CMS]` Quản lý danh mục blog, Viết bài (Rich Text Editor).
- `[System]` Cấu hình hệ thống.

**2.2 Driver App (Capacitor)**
- `[Auth]` Đăng nhập tài xế.
- `[Route]` Lộ trình giao hàng hôm nay (Danh sách đơn gán cho tài xế).
- `[Order]` Chi tiết đơn giao (Thông tin khách, đường đi, số tiền cần thu).
- `[Action]` Màn hình xác nhận giao hàng (Nhập số tiền thực thu).

**2.3 Customer Site (Nuxt)**
- `[Home]` Landing page giới thiệu, Lịch sử xưởng, Blog.
- `[Shop]` Xem sản phẩm, Form đặt hàng nhanh (Guest - có Honeypot).
- `[Portal]` (Dành cho khách sỉ đăng nhập): Lịch sử đơn hàng cá nhân, Xem công nợ hiện tại.

## 3. Route (Routing)
- Phân tách theo cấu trúc thư mục của Nuxt 3 (File-based routing).
- **Public Routes:** `/`, `/san-pham`, `/tin-tuc/*`, `/dat-hang-nhanh`, `/auth/login`.
- **Admin Routes:** `/admin`, `/admin/users`, `/admin/orders/*`, `/admin/inventory/*`,...
- **Driver Routes:** (Chạy local trên App) `/driver/login`, `/driver/routes`, `/driver/orders/:id`.

## 4. Navigation (Điều hướng)
- **Web Admin:** Sidebar navigation bên trái (Có thể thu gọn / Expand) + Topbar (Hiển thị Avatar, Dropdown Logout, Noti).
- **Driver App:** Bottom Navigation Bar (Tabs: Tuyến đường, Tài khoản). Header nhỏ phía trên.
- **Customer Site:** Sticky Header Navbar (Logo, Menu, Nút Đăng nhập/Giỏ hàng).

## 5. Layout
Sử dụng tính năng Layout của Nuxt:
- `default.vue`: Layout cho Customer Site (Header, Main, Footer).
- `admin.vue`: Layout cho Admin (Sidebar, Header, Main Content dạng hộc tủ chứa scroll).
- `driver.vue`: Layout cho App Mobile (Bỏ qua sidebar, tối đa hóa diện tích Main, Fixed Bottom Bar).
- `auth.vue`: Màn hình split-screen (1 bên banner, 1 bên form đăng nhập).

## 6. Permission (Phân quyền)
- **Router Guards:** Sử dụng Nuxt Middleware (`auth.global.ts`).
  - Check Token tồn tại trong Cookie/Storage. Nếu hết hạn -> Redirect sang Login.
  - Check Role: Vào route `/admin` bắt buộc `role === 'ADMIN'`.
  - Silent Auth cho Customer Site: Nếu có Token thì gắn thêm Header và lấy Profile, nếu không có vẫn cho xem trang Public bình thường.

## 7. Component (Kiến trúc Component)
Áp dụng **Atomic Design** kết hợp với UI Library (như Nuxt UI / Radix Vue / Vuetify):
- **Atoms:** Button, Input, Select, Badge, Avatar, Spinner.
- **Molecules:** FormField (Label + Input + Error Message), SearchBar, Breadcrumb.
- **Organisms:** Navbar, Sidebar, DataTable, OrderForm.
- **Templates/Pages:** Nắp ghép các Organisms lại thành trang hoàn chỉnh.

## 8. Form
- Quản lý trạng thái bằng **VeeValidate** hoặc **Vue UseForm** kết hợp Schema Validation (**Zod** / Yup).
- **Honeypot:** Ở Form Đặt hàng nhanh, thêm trường `website_url` với CSS `opacity: 0; position: absolute; z-index: -1`. Tuyệt đối không dùng `type="hidden"`.
- Các Input bắt buộc nhập (Required) phải có dấu sao đỏ (`*`).
- Format tiền tệ (VND) real-time ngay khi gõ vào ô nhập liệu (ví dụ: `amountCollected`).

## 9. Table (Data Table)
- Bảng ở Admin luôn có: Fixed Header, Fixed Cột Hành động (Action - ngoài cùng bên phải).
- Mật độ hiển thị (Density) dạng Compact để xem được nhiều dữ liệu trên desktop.
- Các ô giá tiền căn phải (Text-right), ô ID căn giữa, text bình thường căn trái.
- Click đúp vào dòng (row) để mở xem chi tiết.

## 10. Search (Tìm kiếm)
- Input Search phải áp dụng **Debounce (300ms - 500ms)** trước khi trigger gọi API.
- Các query search được push lên URL (`?search=...`) để User có thể copy link gửi cho nhau hoặc reload không mất kết quả.

## 11. Filter (Lọc dữ liệu)
- **Vị trí:** Phía trên cùng của Table (Cạnh ô Search) hoặc trong một Drawer (nếu nhiều điều kiện).
- Các Filter chính: Trạng thái (Select), Khoảng thời gian (Date Range Picker), Role.
- Khi áp dụng Filter, dữ liệu form filter đồng bộ tự động 2 chiều với URL Query Params.

## 12. Sort (Sắp xếp)
- Hỗ trợ click vào tiêu đề cột (Column Header) để sort.
- Thay đổi icon sort (Asc/Desc). Truyền tham số `?sortBy=price&sortDirection=desc` xuống API Backend.

## 13. Pagination (Phân trang)
- Sử dụng Server-side Pagination 100%. Không phân trang ở Client với dữ liệu list.
- Component Pagination chuẩn: Nút Prev, Next, Chọn trang, và Cho phép đổi số lượng hiển thị (`Rows per page: 10/20/50`).

## 14. Upload
- Giao diện dạng Drag & Drop (Dropzone) hoặc click chọn file.
- Upload Ảnh Sản phẩm/Blog: Có Thumbnail Preview ảnh ngay lập tức bằng `URL.createObjectURL` trước khi bấm Submit lưu.
- Hỗ trợ xóa ảnh preview khỏi mảng trước khi upload thật. Bắt lỗi vượt quá dung lượng (2MB, 5MB).

## 15. Download & 17. Export
- Xuất CSV đơn hàng ngày: Khi gọi API `GET /exports/orders-today`, API trả về Blob.
- FE tạo hidden link:
  ```javascript
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Orders_Today.csv`);
  document.body.appendChild(link);
  link.click();
  ```
- Hiển thị spinner ở nút Export trong lúc chờ tải.

## 16. Import (Nhập dữ liệu)
- Dự án hiện không có luồng Import file (CSV) từ Excel (trừ Nhập kho bằng form tay). 

## 18. Realtime
- Dùng **Server-Sent Events (SSE)**. FE mở kết nối `EventSource` tới `GET /api/v1/admin/events/sse`.
- Lợi ích: Lắng nghe trạng thái đơn hàng (Tài xế bấm chốt đơn) theo thời gian thực để update Giao diện Admin ngay lập tức mà không cần F5 hay Polling, cực kỳ tiết kiệm băng thông.

## 19. Notification
- **Action Noti:** Dùng **Toast Notification** (góc phải trên màn hình) cho các hành động CRUD (Xanh = Success, Đỏ = Error).
- **Push Noti (Driver App):** Tích hợp SDK Firebase Cloud Messaging (FCM) qua Capacitor. Khi nhận push, hiển thị badge đỏ hoặc In-app Banner.

## 20. Loading State
- **Global:** Thanh chạy ngang trên cùng (NProgress bar) khi chuyển Route.
- **Component:** Hiển thị Spinner nhỏ trong Nút bấm (Button) khi đang submit form. Nút bấm bị disabled để chống spam.
- **Data Load:** Áp dụng Skeleton (xem mục 26).

## 21. Empty State
- Khi danh sách trống, Table/List không hiển thị lưới rỗng, mà hiển thị Illustration (ảnh minh họa) thân thiện kèm dòng text: *"Chưa có dữ liệu"* hoặc *"Chưa có đơn hàng nào"*, kèm theo nút bấm Call-to-action (Ví dụ: *"Tạo đơn ngay"*).

## 22. Error Handling (Xử lý lỗi)
- **API Error:** Bắt lỗi thông qua Axios Interceptor. Nếu HTTP 400 (Validation), parse mảng lỗi của VineJS và map hiển thị đỏ viền ô input tương ứng bằng VeeValidate.
- **System Error (500):** Hiện Toast đỏ "Hệ thống đang bận".
- **401 Unauthorized:** Tự động gọi hàm logout, xóa token, đẩy về trang Đăng nhập.
- **403 Forbidden:** Đẩy về màn hình báo lỗi quyền hoặc hiện Dialog báo "Bạn không có quyền tác vụ này".

## 23. Dialog (Hộp thoại cảnh báo)
- Dùng cho các tác vụ nguy hiểm: Xóa người dùng, Hủy đơn hàng.
- Quy chuẩn: Nút Cancel (Màu xám, bên trái) - Nút Action (Màu Đỏ/Xanh, bên phải). Phải bấm confirm mới gọi API.

## 24. Drawer (Ngăn kéo)
- Dùng Drawer trượt từ bên phải vào để hiển thị Form (Thêm sửa user, sản phẩm) thay vì chuyển trang nếu form ngắn, hoặc dùng chứa Bộ lọc (Filter) nâng cao ở Mobile/Tablet.

## 25. Modal
- Dùng cho hiển thị thông tin cục bộ (Thêm địa chỉ, Cài giá gốc Custom Price, Xem ảnh phóng to).
- Modal phải có tính năng Click outside để đóng, và bấm phím `ESC` để tắt.

## 26. Skeleton (Khung tải dữ liệu)
- Khi fetch dữ liệu Table hoặc Biểu đồ Dashboard, hiển thị các khối xám nhấp nháy mờ (Skeleton Loader) thay vì vòng quay Spinner để tạo cảm giác mượt mà (Perceived Performance cao).

## 27. Responsive
- **Mobile First:** Giao diện Customer Site và App Driver phải tối ưu Mobile đầu tiên.
- **Desktop First:** Web Admin tối ưu cho màn Full HD, các bảng biểu hiển thị đủ cột ngang. Trên mobile, các Table ở Admin phải có thanh cuộn ngang (overflow-x: auto).

## 28. Mobile (Đặc tả thiết bị di động)
- Nút bấm Touch target tối thiểu `44px` x `44px` để dễ bấm.
- Sử dụng **Pull-to-refresh** (Kéo xuống để làm mới) trên Driver App.
- Thay thế Native DatePicker của trình duyệt cho điện thoại thay vì dùng DatePicker tự code phức tạp.

## 29. Desktop (Đặc tả thiết bị PC)
- Hỗ trợ phím tắt (Keyboard shortcuts) nếu có thể (Ví dụ: `Enter` để submit form Login/Search).
- Hỗ trợ hover states (thay đổi màu khi di chuột vào dòng trong table hoặc menu).

## 30. Breadcrumb (Đường dẫn phân cấp)
- Rất quan trọng ở Admin. Ví dụ: `Trang chủ > Quản lý Đơn hàng > Chi tiết đơn #123`.
- Giúp Admin không bị lạc và có thể click quay lại nhanh chóng (sử dụng `<NuxtLink>`).

## 31. UX Flow (Các luồng trải nghiệm chính)
- **Luồng Copy Đơn:** Truy cập Chi tiết đơn cũ $\rightarrow$ Bấm "Copy" $\rightarrow$ Hệ thống điều hướng sang form Tạo mới (`/admin/orders/create`), tự động điền sẵn Data của khách và list SP vào các ô input $\rightarrow$ Admin sửa lại số lượng nếu cần $\rightarrow$ Submit API.
- **Luồng Chốt đơn (Tài xế):** Tài xế đến nơi $\rightarrow$ Sử dụng thao tác **"Kéo trượt sang phải" (Swipe to Confirm)** để tránh bấm nhầm $\rightarrow$ Popup hiện lên yêu cầu nhập `amountCollected` $\rightarrow$ FE sinh `UUIDv4` nạp vào `idempotencyKey` $\rightarrow$ Submit $\rightarrow$ Nếu mất mạng 4G, App lưu UUID và Payload vào **Offline Sync Queue (idb-keyval)**, đánh dấu `DELIVERED_OFFLINE` trên UI $\rightarrow$ Tự động đồng bộ ngầm khi có mạng trở lại.

## 32. UI State Management (Quản lý trạng thái)
- Dùng **Pinia** để lưu trữ: Thông tin Auth (User Data, Token), Danh sách Master Data (Tỉnh/thành, Cấu hình tĩnh), Giỏ hàng khách lẻ (lưu đồng thời xuống LocalStorage).
- Các State cục bộ của form (đang loading, đang gõ) quản lý bằng `ref()` trong Component Vue.

## 33. Edge Case (Tình huống ngoại lệ)
- **Tài khoản đang đăng nhập bị Admin đổi mật khẩu / Xóa:** API trả 401 khi gọi request tiếp theo $\rightarrow$ Interceptor bắt lỗi và đẩy văng User ra màn hình Login ngay lập tức.
- **Xung đột ghi đè dữ liệu (Optimistic Locking):** Khi 2 người cùng sửa 1 đơn, người sau Submit API sẽ bị lỗi `409 Conflict` (Do trường `updatedAt` đã cũ). FE bắt lỗi và hiện Dialog "Dữ liệu đã bị thay đổi bởi người khác, vui lòng tải lại".
- **Cache Tỉnh thành 304:** Cài cắm header `If-None-Match` mỗi lần xin Tỉnh/Thành, nếu chưa đổi BE sẽ ném 304 Not Modified ngay, load app cực nhanh.
- **Giới hạn số lượng (Pagination):** Luôn đảm bảo `limit <= 100`, nếu gửi lớn hơn 100 sẽ bị BE chặn bằng `HTTP 422`.

## 34. Business Exception (Xử lý biệt lệ Nghiệp vụ)
- Khách sỉ vượt hạn mức nợ (`debtLimit`): API trả lỗi. FE bắt lỗi hiển thị cảnh báo đỏ trực quan: "Khách hàng [Tên] đã vượt hạn mức nợ cho phép. Vui lòng thu tiền mặt hoặc yêu cầu thanh toán bớt nợ".
- Xuất kho nguyên vật liệu số lượng lơn hơn tồn kho: Bắt lỗi 400 và highlight ô Input số lượng bằng viền đỏ.

## 35. Dependency giữa các module (Tính phụ thuộc)
- **Orders (Tạo đơn) phụ thuộc vào Users & Products:** Form tạo đơn phải fetch danh sách User để chọn $\rightarrow$ Khi chọn User, tự động gọi API fetch Bảng giá riêng (Custom Price) của User đó $\rightarrow$ Đè mức giá này lên danh sách Products hiển thị trong Form.
- **Dashboard phụ thuộc toàn hệ thống:** Fetch dữ liệu tĩnh nhưng cần đảm bảo các Form lọc ngày tháng (`startDate`, `endDate`) được validate chặt chẽ ở FE (Ví dụ: `startDate` không được lớn hơn `endDate` và không lấy vượt quá thời gian hiện tại) trước khi gửi lên API để tránh lỗi BE 400.
- **Driver Module độc lập cao:** App Tài xế gần như tách biệt. Chú trọng nhất việc giữ Sync trạng thái khi Tài xế offline/chập chờn.
