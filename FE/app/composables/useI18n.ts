export const useI18n = () => {
  const translations: Record<string, string> = {
    'nav.home': 'Trang chủ',
    'nav.products': 'Sản phẩm',
    'nav.news': 'Tin tức',
    'nav.about': 'Giới thiệu',
    'nav.dashboard': 'Bảng điều khiển',
    'nav.myOrders': 'Đơn hàng của tôi',
    'nav.logout': 'Đăng xuất',
    'nav.driverApp': 'Ứng dụng tài xế',
    'customer.quickOrder': 'Đặt hàng nhanh',
    'customer.customerLogin': 'Đăng nhập',
    'app.tagline': 'Bún tươi thủ công - Truyền 3 đời'
  }
  
  const t = (key: string) => {
    return translations[key] || key
  }
  
  return { t }
}
