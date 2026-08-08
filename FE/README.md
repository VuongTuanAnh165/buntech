# BunTech Frontend - Chuyển đổi số Xưởng Bún Gia Đình

Dự án này là toàn bộ mã nguồn Frontend (Nuxt.js) cho hệ thống phần mềm quản lý và vận hành xưởng bún, bao gồm 4 module cốt lõi được xây dựng trong cùng một codebase.

## 🌟 4 Module Chính

1. **Web Admin Dashboard (`/admin`)**: Dành cho Quản lý/Chủ xưởng để điều hành, quản lý khách hàng, công nợ, đơn hàng, kho và thống kê.
2. **Mobile App Tài Xế (`/driver`)**: Dành cho tài xế giao hàng (được build thành Native App thông qua Capacitor). Hiển thị lộ trình tối ưu, xác nhận giao hàng và thu tiền.
3. **Zalo Mini App / Web Form (`/wholesale`)**: Kênh đặt hàng cho khách sỉ tự động nhập số lượng lấy ngày mai.
4. **Website Cửa Ngõ (`/`)**: Landing Page & Blog chuẩn SEO để quảng bá, kéo traffic và thu hút khách hàng mới.

---

## 📂 Cấu Trúc Thư Mục Tiêu Chuẩn

```text
FE/
├── app/
│   ├── components/       # Các UI Component (Được chia nhóm để dễ quản lý)
│   │   ├── admin/        # Component chỉ dùng trong Web Admin
│   │   ├── base/         # Các Base Component tái sử dụng cao (VD: BaseCard, BaseModal)
│   │   ├── driver/       # Component giao diện cho Mobile App
│   │   ├── landing/      # Component dùng cho Website SEO/Landing Page
│   │   └── wholesale/    # Component dùng cho kênh đặt hàng
│   ├── composables/      # Logic xử lý và Quản lý State (Sử dụng useState an toàn trên SSR)
│   ├── layouts/          # Chứa các layout riêng biệt: admin.vue, driver.vue, wholesale.vue...
│   ├── middleware/       # Bảo vệ Route (Ví dụ: auth.ts, guest.ts)
│   ├── pages/            # Nuxt Routing (Tương ứng với 4 module chính)
│   │   ├── admin/        # Các trang quản lý (customers, orders, debt, inventory, statistics)
│   │   ├── blog/         # Chuyên mục Blog chuẩn SEO
│   │   ├── driver/       # Các trang của Mobile App (Giao hàng, Xác nhận thu tiền)
│   │   ├── wholesale/    # Giao diện đặt hàng sỉ
│   │   └── index.vue     # Trang chủ mặt tiền
│   ├── plugins/          # Khởi tạo thư viện, inject các biến global
│   └── utils/            # Các hàm thuần túy (format currency, format date)
├── services/             # Lớp Data Layer thuần túy chứa các logic gọi API ra Backend bên ngoài
├── .agents/              # Nơi chứa các quy tắc AI, cấu hình dành riêng cho team phát triển
├── .docs/                # Tài liệu yêu cầu chi tiết của dự án
└── nuxt.config.ts        # Cấu hình trọng tâm của Nuxt
```

---

## 🛑 Quy Tắc Code Nghiêm Ngặt (Dành cho Lập trình viên & AI)

Để đảm bảo hiệu năng và tính bảo trì, mọi thành viên **BẮT BUỘC** tuân thủ các quy tắc sau (Đã được định nghĩa chi tiết tại `.agents/AGENTS.md`):

1. **Kiến trúc Data Layer & API**:
   - Tuyệt đối **KHÔNG** gọi `$fetch` hoặc API rải rác trong các file UI (`.vue`).
   - Mọi API call phải được định nghĩa tại thư mục `services/`.
   - Kết nối dữ liệu vào UI thông qua `composables/` (Sử dụng `useAsyncData`, `useFetch`).

2. **Ngăn chặn Rò rỉ dữ liệu SSR (SSR Leak)**:
   - **KHÔNG** khai báo biến global bên ngoài thân hàm composable (VD: `const user = ref()`). Phải dùng `useState<Type>('key', () => init)`.
   - Các API thuần của Browser (như `window`, `document`, Capacitor APIs) **phải** được bọc trong `<ClientOnly>` hoặc kiểm tra `import.meta.client` để tránh lỗi Server crash.

3. **Tái sử dụng (DRY) & Nuxt UI**:
   - Tránh việc viết HTML/CSS thuần (ví dụ thẻ `<button>`) nếu Nuxt UI v4 đã hỗ trợ `<UButton>`.
   - Tìm kiếm kỹ trong thư mục `components/base/` xem đã có component tương tự chưa trước khi tạo mới. Mở rộng bằng Props.

4. **Mobile First & Capacitor**:
   - Ưu tiên code CSS/Tailwind cho màn hình Mobile trước, sau đó mới dùng breakpoint `md:`, `lg:` cho Tablet/Desktop.
   - Thư mục `app/pages/driver/` được dùng để xuất thành App Mobile nên giao diện cần tối ưu cho cảm ứng và phần "tai thỏ" (Safe Area) của điện thoại.

5. **Xử lý bảo mật & Môi trường**:
   - Mọi Key/Token nhạy cảm CHỈ được khai báo trong `runtimeConfig` tại `nuxt.config.ts` (không đặt trong `.public`). Không dùng trực tiếp `process.env` ở phía Client.

Chúc team dev code năng suất, mượt mà và chuyển đổi số thành công cho Xưởng Bún! 🚀
