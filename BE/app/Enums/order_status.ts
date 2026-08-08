export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng vừa được tạo, đang chờ xác nhận
  APPROVED = 'approved', // Đơn hàng đã được duyệt, chuẩn bị giao
  PROCESSING = 'processing', // Đang xử lý
  DELIVERING = 'delivering', // Đang giao hàng
  DELIVERED = 'delivered', // Đã giao hàng
  CANCELLED = 'cancelled', // Đơn hàng đã bị hủy
  CANCELED = 'canceled', // Đơn hàng đã bị hủy (alias)
}
