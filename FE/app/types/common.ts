/**
 * Entity gốc — Mọi entity trong hệ thống đều kế thừa từ đây.
 */
export interface BaseEntity {
  id: string | number
  createdAt: string
  updatedAt: string
}

/**
 * Khoảng ngày — Dùng cho filter theo ngày tháng.
 */
export interface DateRange {
  from: string
  to: string
}

/**
 * Hướng sắp xếp dữ liệu.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Options cho Confirm Dialog.
 */
export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'error' | 'warning' | 'primary'
  icon?: string
}

/**
 * Thông tin User hiện tại (lưu trong Pinia Store).
 */
export interface CurrentUser {
  id: string | number
  email: string
  fullName: string
  phone?: string
  avatar?: string
  role: 'admin' | 'driver' | 'wholesale_customer'
}
