# BunTech - Enterprise Order & Logistics Management System

Dự án BunTech bao gồm hệ thống **Backend (AdonisJS)**, **Frontend Web (Nuxt 4 / Vue 3)** và ứng dụng **Mobile App (Capacitor)** dành cho quản trị viên, khách sỉ, khách lẻ và tài xế giao nhận.

Dưới đây là tài liệu hướng dẫn toàn tập cách cài đặt, chạy môi trường lập trình (Dev), triển khai máy chủ (Prod) và build ứng dụng Mobile.

---

## 🏗️ 1. Yêu Cầu Hệ Thống (Prerequisites)
Trước khi chạy dự án, hãy đảm bảo máy bạn đã cài đặt các phần mềm sau:
- **Node.js**: Phiên bản >= 20.x.x
- **NPM**: Đi kèm với Node.js
- **Database**: MySQL (hoặc SQLite mặc định tùy cấu hình môi trường)
- **Môi trường Mobile**: 
  - Android Studio (Nếu muốn build App Android)
  - Xcode & macOS (Nếu muốn build App iOS)

---

## 💻 2. Khởi tạo & Chạy Local (Môi trường Dev)

Dự án chia làm 2 thư mục chính là `be` (Backend) và `fe` (Frontend). Bạn cần mở 2 cửa sổ terminal riêng biệt cho 2 thư mục này.

### Phần A: Chạy Backend (AdonisJS)
1. Di chuyển vào thư mục BE:
   ```bash
   cd be
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Copy file môi trường (nếu chưa có):
   ```bash
   cp .env.example .env
   ```
   *(Nhớ chỉnh sửa thông tin Database và App Key trong file `.env` nếu cần).*
4. Chạy các file di chuyển (Migration) để tạo cấu trúc cơ sở dữ liệu:
   ```bash
   node ace migration:run
   ```
5. Chạy Backend server (Chế độ dev, tự động reload):
   ```bash
   npm run dev
   ```
   *👉 Backend sẽ mặc định chạy ở cổng: `http://localhost:3333`*

### Phần B: Chạy Frontend (Nuxt)
1. Di chuyển vào thư mục FE (Từ thư mục gốc mở một tab terminal mới):
   ```bash
   cd fe
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Copy file môi trường (nếu chưa có):
   ```bash
   cp .env.example .env
   ```
   *(Cấu hình `NUXT_PUBLIC_API_BASE_URL` trỏ về Backend, ví dụ `http://localhost:3333`)*
4. Chạy Frontend server (Chế độ dev):
   ```bash
   npm run dev
   ```
   *👉 Frontend sẽ mặc định chạy ở cổng: `http://localhost:3000`*

---

## 🚀 3. Triển khai Máy chủ (Môi trường Production)

Khi muốn đưa ứng dụng lên Hosting/VPS, bạn cần build mã nguồn thành dạng tối ưu (minified) và chạy bằng Node.js thay vì lệnh dev.

### 3.1. Build & Run Backend
```bash
cd be
npm run build
```
Sau khi build, AdonisJS sẽ xuất mã nguồn ra một thư mục `build/`. Bạn mang thư mục này (kèm `.env` và `package.json`) lên VPS và chạy:
```bash
cd build
npm ci --omit=dev
node bin/server.js
```

### 3.2. Build & Run Frontend (Web App SSR)
Dành cho website bình thường.
```bash
cd fe
npm run build
```
Lệnh này sẽ tạo ra thư mục `.output`. Chạy web bằng lệnh:
```bash
node .output/server/index.mjs
```
*(Thường được cấu hình chạy ngầm bằng PM2: `pm2 start .output/server/index.mjs --name "buntech-fe"`)*

---

## 📱 4. Hướng Dẫn Build Mobile App (Android / iOS)

Hệ thống sử dụng **Capacitor** để biến website FE thành Native App. 

### Bước 1: Build mã nguồn FE thành dạng tĩnh
Di chuyển vào thư mục `fe` và chạy lệnh build dành riêng cho mobile:
```bash
cd fe
npm run build:mobile
```
*(Lệnh này sẽ gọi `nuxt generate` để tạo HTML tĩnh ở `.output/public`, đồng thời gọi `npx cap sync` để đẩy code vào nền tảng di động).*

### Bước 2: Thêm Platform (Chỉ làm lần đầu tiên)
Nếu thư mục `android` hoặc `ios` chưa tồn tại trong `fe`, hãy chạy:
```bash
npx cap add android
npx cap add ios
```

### Bước 3: Build ra App

**Đối với Android (Dùng Android Studio):**
```bash
npx cap open android
```
- Đợi Android Studio hoàn tất tiến trình Gradle Sync.
- Bạn có thể cắm cáp điện thoại Android hoặc mở Emulator. Nhấn nút **Play (Run)** trên thanh công cụ để cài App.
- Nếu muốn xuất file `.apk` để gửi cho người khác: Vào menu `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

**Đối với iOS (Dùng Xcode trên máy Mac):**
```bash
npx cap open ios
```
- Nhấp vào root project có tên "App" ở thanh bên trái.
- Chọn tab **Signing & Capabilities** và chọn Apple Developer Account của bạn ở phần **Team**.
- Cắm iPhone hoặc chọn Simulator, sau đó bấm nút **Play (Run)** góc trên cùng bên trái.

### 🔄 Cách cập nhật App sau khi sửa code Frontend:
Bất cứ khi nào bạn sửa code hiển thị ở thư mục FE và muốn cập nhật lên App, bạn **KHÔNG CẦN** đụng vào Android Studio hay Xcode. Bạn chỉ việc chạy lại lệnh:
```bash
npm run build:mobile
```
Sau đó mở lại Android Studio/Xcode và ấn nút **Run** (Play) là app sẽ nhận diện giao diện và code mới nhất!