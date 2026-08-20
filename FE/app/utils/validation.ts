import { z } from 'zod'
import { t } from '~/utils/i18n'

/**
 * Schema validate số điện thoại Việt Nam (10 số, bắt đầu bằng 0).
 */
export const phoneSchema = z
  .string()
  .min(1, t('val_phone_req'))
  .regex(/^0\d{9}$/, t('val_phone_invalid'))

/**
 * Schema validate email.
 */
export const emailSchema = z.string().min(1, t('val_email_req')).email(t('val_email_invalid'))

/**
 * Schema validate mật khẩu: tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 số.
 */
export const passwordSchema = z
  .string()
  .min(8, t('val_pass_min'))
  .regex(/[A-Z]/, t('val_pass_upper'))
  .regex(/[0-9]/, t('val_pass_num'))

/**
 * Tạo schema string bắt buộc với tên trường tùy chỉnh.
 * @example requiredString('Tên khách hàng') → z.string().min(1, 'Tên khách hàng không được để trống')
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, t('val_required_field', { fieldName }))

/**
 * Tạo schema số dương bắt buộc (> 0).
 * @example positiveNumber('Số lượng') → z.number().positive('Số lượng phải lớn hơn 0')
 */
export const positiveNumber = (fieldName: string) =>
  z
    .number({ error: t('val_required_field', { fieldName }) })
    .positive(t('val_positive_field', { fieldName }))

/**
 * Schema validate số không âm (>= 0).
 * @example nonNegativeNumber('Giá') → z.number().min(0, 'Giá không được âm')
 */
export const nonNegativeNumber = (fieldName: string) =>
  z
    .number({ error: t('val_required_field', { fieldName }) })
    .min(0, t('val_non_negative_field', { fieldName }))

/**
 * Schema string tùy chọn — cho phép rỗng hoặc undefined.
 */
export const optionalString = z.string().optional().or(z.literal(''))

export const loginSchema = z.object({
  phoneNumber: phoneSchema,
  password: requiredString(t('val_password')),
  rememberMe: z.boolean().optional()
})

export const forgotPasswordSchema = z.object({
  phoneNumber: phoneSchema
})

export const resetPasswordSchema = z
  .object({
    phoneNumber: phoneSchema,
    token: requiredString(t('val_otp')),
    newPassword: passwordSchema,
    confirmPassword: requiredString(t('val_confirm_pass'))
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('val_pass_mismatch'),
    path: ['confirmPassword']
  })

export const changePasswordSchema = z
  .object({
    oldPassword: requiredString(t('val_old_pass')),
    newPassword: passwordSchema,
    confirmPassword: requiredString(t('val_confirm_pass'))
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('val_pass_mismatch'),
    path: ['confirmPassword']
  })

export const updateProfileSchema = z.object({
  fullName: requiredString(t('val_fullname')),
  avatarUrl: z.string().url(t('val_url_invalid')).optional()
})
