/**
 * Cấu trúc Response chuẩn từ Backend API.
 * Mọi API endpoint đều trả về format này.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errorCode?: string
}

/**
 * Metadata phân trang trả về từ Backend.
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Response có phân trang — dùng cho các API list (GET /customers, GET /orders...).
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
  message?: string
}

/**
 * Query params phân trang gửi lên Backend.
 * Dùng chung cho mọi API list.
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Option chung cho các dropdown/select.
 * Dùng chung cho USelect, USelectMenu, URadioGroup...
 */
export interface SelectOption<T = string> {
  label: string
  value: T
  icon?: string
  disabled?: boolean
}
