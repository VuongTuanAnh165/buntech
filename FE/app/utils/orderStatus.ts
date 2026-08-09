import { OrderStatus } from './enums'

/** Human-readable labels for each order status */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PROCESSING]: 'Đang chuẩn bị',
  [OrderStatus.SHIPPING]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy'
}

/** Nuxt UI color tokens for each order status */
export const ORDER_STATUS_COLORS: Record<
  string,
  'warning' | 'info' | 'primary' | 'success' | 'neutral'
> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.SHIPPING]: 'primary',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'neutral'
}

/** Lucide icon class for each order status */
export const ORDER_STATUS_ICONS: Record<string, string> = {
  [OrderStatus.PENDING]: 'i-lucide-clock',
  [OrderStatus.PROCESSING]: 'i-lucide-package',
  [OrderStatus.SHIPPING]: 'i-lucide-truck',
  [OrderStatus.DELIVERED]: 'i-lucide-check-circle-2',
  [OrderStatus.CANCELLED]: 'i-lucide-x-circle'
}

/** Ordered status flow for timeline progression */
export const ORDER_STATUS_FLOW = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED
] as const

/** Get a human-readable label for an order status */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status
}
