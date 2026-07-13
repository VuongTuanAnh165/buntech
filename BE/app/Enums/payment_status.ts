export enum PaymentStatus {
  UNPAID = 'unpaid', // Đơn hàng chưa được thanh toán
  PAID = 'paid', // Đơn hàng đã được thanh toán đầy đủ
  DEBT = 'debt', // Khách hàng mua nợ (ghi nhận vào công nợ)
}
