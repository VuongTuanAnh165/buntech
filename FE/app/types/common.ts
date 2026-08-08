import type { Role } from '~/enums/role'

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

export interface CurrentUserProfile {
  avatarUrl: string | null
  storeName: string | null
  currentDebt: string | null
  debtLimit: string | null
  zaloUserId: string | null
}

/**
 * Thông tin User hiện tại (lưu trong Pinia Store).
 */
export interface CurrentUser {
  id: string | number
  fullName: string
  phoneNumber: string
  role: Role
  profile: CurrentUserProfile | null
}
