import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

// Khởi tạo dayjs với locale tiếng Việt và plugin
dayjs.extend(relativeTime)
dayjs.locale('vi')

/**
 * Format số tiền sang VNĐ.
 * @example formatCurrency(1500000) → '1.500.000 ₫'
 * @example formatCurrency(-200000) → '-200.000 ₫'
 * @example formatCurrency(0) → '0 ₫'
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

export const formatVND = formatCurrency

/**
 * Format số tiền rút gọn (không ký hiệu tiền tệ).
 * @example formatNumber(1500000) → '1.500.000'
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '0'
  return new Intl.NumberFormat('vi-VN').format(value)
}

/**
 * Format cân nặng (kg).
 * @example formatWeight(25.5) → '25,5 kg'
 * @example formatWeight(100) → '100 kg'
 */
export const formatWeight = (kg: number | null | undefined): string => {
  if (kg == null) return '0 kg'
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(kg)} kg`
}

/**
 * Format ngày theo chuẩn Việt Nam.
 * @example formatDate('2026-07-09') → '09/07/2026'
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

/**
 * Format ngày giờ theo chuẩn Việt Nam.
 * @example formatDateTime('2026-07-09T08:30:00') → '09/07/2026 08:30'
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

/**
 * Format thời gian tương đối (relative).
 * @example formatRelativeTime('2026-07-09T06:00:00') → '2 giờ trước'
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

export const formatTimeAgo = formatRelativeTime

/**
 * Format số điện thoại Việt Nam.
 * @example formatPhone('0912345678') → '0912 345 678'
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Parse input string to VND number.
 * @example parseVNDInput('1.500.000 ₫') → 1500000
 */
export const parseVNDInput = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, '')
  return cleaned ? parseInt(cleaned) : 0
}

/**
 * Format number to VND string for inputs.
 * @example formatVNDInput(1500000) → '1.500.000'
 */
export const formatVNDInput = (value: number): string => {
  if (!value) return ''
  return new Intl.NumberFormat('vi-VN').format(value)
}

/**
 * Format image URL (handles relative URLs)
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  // Remove /api or /api/v1 from apiBaseUrl to get the root URL
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl.replace(/\/api(\/v\d+)?$/, '')
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`
}
