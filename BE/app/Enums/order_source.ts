export enum OrderSource {
  ADMIN_POS = 'admin_pos', // Đơn hàng được tạo thủ công từ hệ thống quản trị (POS)
  ZALO_APP = 'zalo_app', // Đơn hàng khách hàng tự đặt qua Zalo Mini App
  DRIVER_APP = 'driver_app', // Đơn hàng do tài xế tạo hộ khách qua Driver App
  AUTO_COPY = 'auto_copy', // Đơn hàng tự động sao chép từ lịch trình định kỳ
  ADMIN = 'admin',
  WEB_QUICK_ORDER = 'web_quick_order',
}
