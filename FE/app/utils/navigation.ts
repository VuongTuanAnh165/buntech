import type { NavigationMenuItem } from '@nuxt/ui'

export const adminNavigationItems: NavigationMenuItem[][] = [
  [
    {
      label: 'Tổng quan',
      icon: 'i-lucide-layout-dashboard',
      to: '/admin'
    },
    {
      label: 'Khách hàng',
      icon: 'i-lucide-users',
      to: '/admin/customers'
    },
    {
      label: 'Đơn hàng',
      icon: 'i-lucide-shopping-cart',
      to: '/admin/orders'
    },
    {
      label: 'Sản phẩm',
      icon: 'i-lucide-package',
      children: [
        { label: 'Danh sách SP', to: '/admin/products' },
        { label: 'Danh mục', to: '/admin/products/categories' },
        { label: 'Đánh giá', to: '/admin/products/reviews' }
      ]
    },
    {
      label: 'Công nợ',
      icon: 'i-lucide-wallet',
      to: '/admin/debt'
    }
  ],
  [
    {
      label: 'Kho / Nguyên liệu',
      icon: 'i-lucide-warehouse',
      children: [
        { label: 'Tồn kho', to: '/admin/inventory' },
        { label: 'Báo cáo hao hụt', to: '/admin/inventory/loss-report' }
      ]
    },
    {
      label: 'Blog',
      icon: 'i-lucide-file-text',
      children: [
        { label: 'Bài viết', to: '/admin/blog' },
        { label: 'Danh mục', to: '/admin/blog/categories' }
      ]
    },
    {
      label: 'Thống kê',
      icon: 'i-lucide-chart-bar',
      to: '/admin/statistics'
    },
    {
      label: 'Cấu hình hệ thống',
      icon: 'i-lucide-settings',
      to: '/admin/system'
    }
  ]
]

export const driverNavigationItems: NavigationMenuItem[] = [
  {
    label: 'Giao hàng',
    icon: 'i-lucide-truck',
    to: '/driver/delivery'
  },
  {
    label: 'Lịch sử',
    icon: 'i-lucide-history',
    to: '/driver/history'
  },
  {
    label: 'Thông báo',
    icon: 'i-lucide-bell',
    to: '/driver/notifications'
  },
  {
    label: 'Phương tiện',
    icon: 'i-lucide-car',
    to: '/driver/vehicle'
  },
  {
    label: 'Tài khoản',
    icon: 'i-lucide-user',
    to: '/driver/profile'
  }
]

export const publicNavigationItems: NavigationMenuItem[] = [
  { label: 'Trang chủ', icon: 'i-lucide-home', to: '/' },
  { label: 'Sản phẩm', icon: 'i-lucide-package', to: '/products' },
  { label: 'Đặt hàng', icon: 'i-lucide-shopping-cart', to: '/quick-order' },
  { label: 'Tin tức', icon: 'i-lucide-newspaper', to: '/blog' },
  { label: 'Giới thiệu', icon: 'i-lucide-info', to: '/gioi-thieu' }
]
