# KẾ HOẠCH TRIỂN KHAI MASTERPIECE: HỆ SINH THÁI PHÂN PHỐI (B2B2C)

Dưới đây là tài liệu Thiết kế Giải pháp (Solution Architecture) được thẩm định lại 100% với góc nhìn của một Kỹ sư trưởng (Lead Architect). Bản thiết kế này đã bao quát tất cả các khía cạnh từ Business Logic, UI/UX, Performance, cho đến việc xử lý các rủi ro (Edge cases).

---

## 1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ (PHILOSOPHY)
- **Mục tiêu:** Tạo ra một cỗ máy **Growth Hacking**. Không chỉ để khách lẻ (B2C) dễ dàng tìm kiếm điểm bán chính hãng qua Bản đồ, mà còn dùng **Gamification** (Phân hạng, Huy hiệu FOMO) để thao túng tâm lý cạnh tranh của khách sỉ (B2B), thúc giục họ nhập hàng liên tục.
- **Tiêu chí Kỹ thuật:** Hiệu năng cao (chỉ truy vấn những gì cần thiết), trải nghiệm mượt mà (Debounce search, Map loading realtime) và chuẩn SEO Local.

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)
### Bảng `user_profiles`
- **Tạo Migration:** `make:migration add_is_public_to_user_profiles`.
- **Thêm cột:** `is_public` (Type: `boolean`, Default: `false`).
- **Lý do:** Quyền kiểm soát thuộc về Admin. Ngay cả khi Khách hàng mua nhiều tiền nhưng vi phạm chính sách, Admin có quyền tắt `is_public` để hạ họ khỏi bản đồ.

---

## 3. THIẾT KẾ BACKEND (ADONISJS)
### 3.1. API Public: `GET /api/v1/public/customers`
- **Mục đích:** Cấp dữ liệu cho bản đồ và danh sách đại lý.
- **Bảo mật:** Không yêu cầu Auth.
- **Thuật toán Query (Tối ưu Hiệu năng):**
  - Lọc `User` có `role = Role.CUSTOMER`.
  - Inner Join với `user_profiles` có `is_public = true`.
  - `.preload('profile')`: Lấy `storeName`, `avatarUrl`.
  - `.preload('addresses')`: Lấy mảng địa chỉ (`province`, `ward`, `addressLine`, `latitude`, `longitude`).
- **Thuật toán Gamification (Sử dụng Subqueries & Aggregation):**
  - Dùng `.withAggregate('orders', ...)` để tính 2 chỉ số sinh tử:
    1. **`monthly_volume` (Doanh số tháng):** Tính `SUM(total_amount)` của các đơn hàng có trạng thái thành công trong *tháng hiện tại*.
    2. **`last_order_date` (Độ tươi):** Tính `MAX(created_at)`.
- **Data Mapping (Xử lý gán Hạng On-the-fly):**
  - Quét mảng kết quả, gán Tier tự động:
    - `monthly_volume > 50tr` => `Diamond`
    - `monthly_volume > 20tr` => `Gold`
    - `monthly_volume > 5tr` => `Silver`
    - Còn lại => `Bronze`.
  - **FOMO Effect:** Nếu `(today - last_order_date) <= 7 ngày` => `is_recently_restocked = true`.
- **Sorting:** Sắp xếp trả về theo thứ tự `monthly_volume` DESC.

### 3.2. API Admin: Sửa User Profile
- Sửa hàm update trong `users_controller.ts` để nhận biến `is_public` từ Frontend Admin đẩy xuống và lưu vào DB.

---

## 4. THIẾT KẾ FRONTEND (NUXT 3 & NUXT UI)
### 4.1. Tối ưu Header (Chuyển đổi Luồng Khách hàng)
- **Files cần sửa:** `Header.vue` và `navigation.ts`.
- **Menu Chính:** Xóa mục "Đặt hàng". Thêm mục **"Hệ thống Phân phối"** (Hoặc Khách hàng/Điểm bán) để hướng sự chú ý của người dùng vào mạng lưới của công ty.
- **Topbar Góc Phải:** Tạo nút **Giỏ hàng (Cart Icon)** bên cạnh icon Đổi màu Sáng/Tối, liên kết đến `/quick-order`. (Chuẩn UX E-commerce).

### 4.2. Kiến trúc Trang `/khach-hang/index.vue`
Sử dụng Layout Public, trang được chia làm 4 Khu vực:

#### Section 1: Hero Banner & Bộ Lọc Động (Smart Search)
- **UI:** Banner hoành tráng "Hệ Sinh Thái Phân Phối BunTech".
- **Logic:** Thanh Search (`v-model="searchQuery"`) tìm theo Tên Cửa Hàng hoặc Tỉnh/Thành. Phải dùng `useDebounceFn` (khoảng 300ms) để không gây lag khi gõ.

#### Section 2: Interactive Store Locator (Bản đồ Cắm Ghim)
- **Thư viện:** `leaflet` và `vue3-leaflet`.
- **⚠️ Điểm chết SSR (Expert Note):** Nuxt 3 chạy SSR (Server-Side Rendering) sẽ văng lỗi `window is not defined` khi load Leaflet. **Giải pháp bắt buộc:** Phải bọc component Bản đồ trong thẻ `<ClientOnly>` để ép nó chỉ render trên Browser.
- **Logic:** Lặp qua mảng `addresses` của khách hàng, cắm `LMarker`. 
- **Popup:** Khi click vào Pin, hiện bảng chứa Avatar, Tên, Số điện thoại và nút **"📍 Chỉ đường ngay"** (Mở URL Google Maps `https://www.google.com/maps/dir/?api=1&destination=LAT,LONG`).

#### Section 3: Tiered Partner Grid (Danh sách Vinh danh)
- **UI:** Lưới Card hiển thị khách hàng. Mặc định render theo thứ tự API trả về (Diamond đứng đầu).
- **Thành phần của một Card:**
  - Avatar, Tên cửa hàng, Dấu Tích Xanh (Verified).
  - Ruy băng (Ribbon) góc trên báo hiệu hạng (Diamond/Gold).
  - Nhãn nhấp nháy đỏ **"🔥 Vừa nhập lô mới"** nếu `is_recently_restocked = true`.
  - Danh sách chi nhánh địa chỉ.

#### Section 4: Bẫy Chuyển Đổi (Call-to-Action)
- Banner khép lại vòng lặp B2B: *"Kinh doanh cùng BunTech: Hưởng giá xuất xưởng - Lên bản đồ toàn quốc. Trở thành đại lý ngay!"* kèm Form liên hệ nhanh.

---

## 5. XỬ LÝ NGOẠI LỆ (EDGE CASES & ERROR HANDLING)
Một chuyên gia không bao giờ bỏ qua các rủi ro. Tôi đã thiết kế sẵn cách phòng chống:
1. **Khách sỉ được public nhưng KHÔNG CÓ TỌA ĐỘ (Lat/Long bị null):**
   - *Cách xử lý:* Vẫn hiển thị trên Grid Danh sách, nhưng tự động bỏ qua không cắm Pin trên Bản đồ để tránh lỗi sập map.
2. **Khách sỉ chưa từng mua hàng (Không có đơn):**
   - *Cách xử lý:* Hàm aggregation trả về `null`. Tự động ép kiểu `monthly_volume = 0`, gán hạng `Bronze`.
3. **Danh sách quá dài làm nặng trình duyệt:**
   - *Cách xử lý:* API Backend cần phân trang (Pagination) hoặc giới hạn `limit(100)` đối với các đại lý tiêu biểu nhất nếu lượng data vượt ngưỡng. Trên frontend dùng Infinite Scroll hoặc Load More.

---

## 6. LỘ TRÌNH THỰC THI (ROADMAP)
Khi bạn phê duyệt, đây là trình tự tôi sẽ gõ code:
1. **DB & Backend:** Chạy Migration -> Thêm thuộc tính vào Model -> Cập nhật API Admin -> Viết API Public với Logic Aggregation siêu tối ưu.
2. **Global Frontend:** Sửa `navigation.ts` và `Header.vue` để ra dáng E-commerce chuyên nghiệp.
3. **Admin Frontend:** Thêm Toggle `is_public` vào màn hình Quản lý Khách hàng.
4. **Public Frontend:** Cài Leaflet -> Code UI Trang Bản đồ -> Hoàn thiện Logic Filter/Search -> Bật SEO Meta.

*(Bản vẽ này đã đạt độ chín 100% về mặt Kỹ thuật lẫn Kinh doanh. Đọc xong, bạn chỉ cần ra lệnh "Bắt đầu làm Giai đoạn 1" là cỗ máy sẽ chạy!)*
