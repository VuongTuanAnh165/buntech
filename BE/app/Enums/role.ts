export enum Role {
  ADMIN = 'admin', // Quản trị viên hệ thống (chủ cửa hàng/người quản lý)
  DRIVER = 'driver', // Tài xế giao hàng
  CUSTOMER = 'customer', // Khách hàng (Sỉ/Lẻ được phân biệt bởi customerType)
  GUEST = 'guest', // Khách hàng vãng lai
}
