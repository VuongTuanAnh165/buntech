export enum DeliveryStatus {
  PENDING = 'pending', // Đơn hàng mới, đang chờ điều phối giao hàng
  DELIVERING = 'delivering', // Tài xế đang trên đường giao hàng cho khách
  SUCCESS = 'success', // Giao hàng thành công
  FAILED = 'failed', // Giao hàng thất bại (khách không nhận, sai địa chỉ...)
}
