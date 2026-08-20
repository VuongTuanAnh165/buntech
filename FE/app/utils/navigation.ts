import type { NavigationMenuItem } from '@nuxt/ui'
import { t } from '~/utils/i18n'

export const adminNavigationItems: NavigationMenuItem[][] = [
  [
    {
      label: t('nav_overview'),
      icon: 'i-lucide-house',
      to: '/admin'
    },
    {
      label: t('common_customer'),
      icon: 'i-lucide-users',
      to: '/admin/customers'
    },
    {
      label: t('nav_orders'),
      icon: 'i-lucide-shopping-cart',
      to: '/admin/orders'
    },
    {
      label: t('nav_products'),
      icon: 'i-lucide-package',
      children: [
        { label: t('nav_product_list'), to: '/admin/products' },
        { label: t('nav_categories'), to: '/admin/products/categories' },
        { label: t('nav_reviews'), to: '/admin/products/reviews' }
      ]
    },
    {
      label: t('nav_debt'),
      icon: 'i-lucide-wallet',
      to: '/admin/debt'
    }
  ],
  [
    {
      label: t('nav_inventory_raw'),
      icon: 'i-lucide-box',
      children: [
        { label: t('nav_inventory'), to: '/admin/inventory' },
        { label: t('nav_loss_report'), to: '/admin/inventory/loss-report' }
      ]
    },
    {
      label: t('nav_blog'),
      icon: 'i-lucide-file-text',
      children: [
        { label: t('nav_blog_posts'), to: '/admin/blog' },
        { label: t('nav_categories'), to: '/admin/blog/categories' }
      ]
    },
    {
      label: t('nav_statistics'),
      icon: 'i-lucide-pie-chart',
      to: '/admin/statistics'
    },
    {
      label: t('nav_system_config'),
      icon: 'i-lucide-settings',
      to: '/admin/system'
    }
  ]
]

export const driverNavigationItems: NavigationMenuItem[] = [
  {
    label: t('nav_delivery'),
    icon: 'i-lucide-truck',
    to: '/driver/delivery'
  },
  {
    label: t('driver_history'),
    icon: 'i-lucide-history',
    to: '/driver/history'
  },
  {
    label: t('driver_notifications'),
    icon: 'i-lucide-bell',
    to: '/driver/notifications'
  },
  {
    label: t('driver_vehicle'),
    icon: 'i-lucide-car',
    to: '/driver/vehicle'
  },
  {
    label: t('profile'),
    icon: 'i-lucide-user',
    to: '/driver/profile'
  }
]

export const publicNavigationItems: NavigationMenuItem[] = [
  { label: t('nav_home'), to: '/' },
  { label: t('nav_products'), to: '/products' },
  { label: t('nav_distribution'), to: '/distribution' },
  { label: t('nav_wholesale'), to: '/wholesale' }
]
