# Kế hoạch Hoàn thiện Hệ thống Thông báo (Notification) & Realtime

Mục tiêu: Xây dựng một hệ thống thông báo toàn diện cho cả Tài xế (Driver) và Khách hàng (Customer) với tiêu chí **100% Miễn phí (Zero Cost)**. Chúng ta sẽ loại bỏ các giải pháp tốn phí (như Zalo ZNS, SMS) và tập trung vào các công nghệ có sẵn hoặc miễn phí hoàn toàn.

## User Review Required

> [!IMPORTANT]
> **Firebase Service Account:** Để Push Notification (FCM) hoạt động, bạn sẽ cần tạo một project trên [Firebase Console](https://console.firebase.google.com/) (Hoàn toàn miễn phí). Sau đó tải file `serviceAccountKey.json` về bỏ vào source Backend. Bạn đã có project Firebase chưa?
>
> **Background Jobs:** Để tránh làm chậm API khi gửi thông báo, chúng ta có thể dùng Redis Queue (có sẵn, miễn phí) hoặc chạy bất đồng bộ (async). Kế hoạch dưới đây sẽ dùng `Promise.allSettled` (async) để đơn giản hóa kiến trúc mà không cần cài thêm thư viện Queue phức tạp. Bạn có đồng ý với cách tiếp cận tinh gọn này không?

## Giải pháp 100% Miễn phí

1. **Push Notifications:** Sử dụng **Firebase Cloud Messaging (FCM)**. Google cung cấp dịch vụ này hoàn toàn miễn phí không giới hạn số lượng tin nhắn gửi đi.
2. **In-App Notifications:** Lưu trữ thẳng vào Database PostgreSQL/MySQL hiện tại của bạn. (Bảng `notifications`).
3. **Realtime Web/App:** Kế thừa kiến trúc **Server-Sent Events (SSE) + Redis Pub/Sub** đã có sẵn trên Backend. SSE chạy trên HTTP tiêu chuẩn, không tốn thêm bất kỳ chi phí dịch vụ bên ngoài nào (như Pusher hay Socket.io Pro).
4. **Email (Tùy chọn):** Nếu cần thiết, có thể dùng SMTP của Gmail cá nhân (Miễn phí 500 mail/ngày) hoặc Resend/SendGrid bản Free. Tạm thời mình sẽ không đưa vào để tập trung vào Notification App.

---

## Chi tiết Triển khai (Proposed Changes)

Dưới đây là các file sẽ bị sửa đổi hoặc tạo mới.

### 1. Cấu hình Firebase Admin (Backend)
Để có thể gọi API bắn thông báo xuống điện thoại của tài xế.

#### [NEW] `BE/app/services/firebase_service.ts`
- Khởi tạo `firebase-admin` sử dụng thông tin từ file config JSON.

#### [MODIFY] `BE/package.json`
- Chạy lệnh cài đặt `firebase-admin` (`npm install firebase-admin`).

### 2. Xây dựng Trung tâm Thông báo (Notification Engine)
Gộp chung việc lưu Database và gửi Push Notification.

#### [MODIFY] `BE/app/services/notification_service.ts`
- Bổ sung hàm `sendNotification(userId, title, body, type, data)`:
  - Tạo bản ghi mới vào bảng `notifications` (DB).
  - Lấy tất cả `fcm_token` của user đó từ bảng `device_tokens`.
  - Gọi `FirebaseService.sendMulticast(...)` để bắn thông báo tới các thiết bị.

### 3. Gắn thông báo vào luồng Nghiệp vụ (Events)
Khi nào thì hệ thống sẽ gửi thông báo?

#### [MODIFY] `BE/app/services/admin_order_service.ts`
- Tại hàm `batchAssignDriver`: Thêm logic gọi `NotificationService.sendNotification` cho Tài xế để báo "Bạn vừa được phân công giao các đơn hàng mới".
- Phát ra sự kiện `emitter.emit('driver:assigned', driverId)`.

#### [MODIFY] `BE/app/listeners/order_listener.ts`
- Bổ sung các handler để bắt sự kiện thay đổi trạng thái đơn hàng (PENDING -> DELIVERING -> DELIVERED).
- Nếu đơn hàng chuyển sang `DELIVERING`: Thông báo cho Khách hàng "Đơn hàng của bạn đang trên đường giao".

### 4. Mở rộng luồng Realtime (SSE) cho Driver và Customer
Giúp màn hình App của Driver tự động tải lại danh sách đơn hàng mà không cần vuốt xuống.

#### [MODIFY] `BE/start/routes.ts`
- Mở thêm 2 endpoint mới:
  - `GET /api/v1/driver/events/sse` (Dành cho app tài xế).
  - `GET /api/v1/customer/events/sse` (Dành cho app khách hàng).

#### [NEW] `BE/app/controllers/driver_events_controller.ts` & `customer_events_controller.ts`
- Tương tự như `EventsController` hiện tại của Admin, nhưng sẽ lọc dữ liệu. Chỉ đẩy dữ liệu (write SSE stream) nếu sự kiện đó thuộc về chính `userId` của tài xế/khách hàng đang kết nối.

#### [MODIFY] Front-end (FE) Layouts & Composables
- **Tài xế:** Chỉnh sửa `FE/app/layouts/driver.vue` để kết nối tới `/api/v1/driver/events/sse`. Khi nhận được sự kiện `driver:assigned`, tự động gọi lại API fetch danh sách route (đơn hàng cần giao).
- **Khách hàng:** Chỉnh sửa layout để kết nối tới `/api/v1/customer/events/sse`.

---

## Verification Plan

### Manual Verification
1. **Test Push Notification:** Cài đặt App FE lên máy ảo Android/iOS, đăng nhập quyền Tài xế. Dùng tài khoản Admin giao đơn hàng cho tài xế đó. Kiểm tra xem điện thoại có hiện popup/banner thông báo từ hệ thống không.
2. **Test In-App Notification:** Mở tab "Thông báo" trên app Tài xế, kiểm tra xem có lịch sử thông báo "Bạn được phân công giao đơn" mới xuất hiện không.
3. **Test Realtime SSE:** Mở song song màn hình danh sách chuyến đi của Tài xế và màn hình Admin. Khi Admin click "Giao đơn", màn hình danh sách của Tài xế tự động nhảy thêm đơn mà không cần tải lại trang.
