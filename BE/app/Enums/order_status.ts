export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng vừa được tạo, đang chờ xác nhận
  APPROVED = 'approved', // Đơn hàng đã được duyệt, chuẩn bị giao
  CANCELLED = 'cancelled', // Đơn hàng đã bị hủy
}
