import { z } from 'zod'

/**
 * Schema validate số điện thoại Việt Nam (10 số, bắt đầu bằng 0).
 */
export const phoneSchema = z
  .string()
  .min(1, 'Số điện thoại không được để trống')
  .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (phải 10 số, bắt đầu bằng 0)')

/**
 * Schema validate email.
 */
export const emailSchema = z
  .string()
  .min(1, 'Email không được để trống')
  .email('Email không đúng định dạng')

/**
 * Schema validate mật khẩu: tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 số.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')

/**
 * Tạo schema string bắt buộc với tên trường tùy chỉnh.
 * @example requiredString('Tên khách hàng') → z.string().min(1, 'Tên khách hàng không được để trống')
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} không được để trống`)

/**
 * Tạo schema số dương bắt buộc (> 0).
 * @example positiveNumber('Số lượng') → z.number().positive('Số lượng phải lớn hơn 0')
 */
export const positiveNumber = (fieldName: string) =>
  z.number({ error: `${fieldName} không được để trống` }).positive(`${fieldName} phải lớn hơn 0`)

/**
 * Schema validate số không âm (>= 0).
 * @example nonNegativeNumber('Giá') → z.number().min(0, 'Giá không được âm')
 */
export const nonNegativeNumber = (fieldName: string) =>
  z.number({ error: `${fieldName} không được để trống` }).min(0, `${fieldName} không được âm`)

/**
 * Schema string tùy chọn — cho phép rỗng hoặc undefined.
 */
export const optionalString = z.string().optional().or(z.literal(''))
