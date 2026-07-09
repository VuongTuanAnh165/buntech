import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Menu điều hướng Sidebar Admin.
 * Tập trung cấu hình 1 nơi — mọi thay đổi menu chỉ sửa file này.
 */
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
      to: '/admin/orders',
      children: [
        {
          label: 'Danh sách đơn',
          to: '/admin/orders'
        },
        {
          label: 'POS bán lẻ',
          to: '/admin/orders/pos'
        }
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
      to: '/admin/inventory'
    },
    {
      label: 'Thống kê',
      icon: 'i-lucide-chart-bar',
      to: '/admin/statistics'
    }
  ]
]

/**
 * Menu điều hướng Bottom Bar cho Driver App.
 */
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
    label: 'Tài khoản',
    icon: 'i-lucide-user',
    to: '/driver/account'
  }
]
