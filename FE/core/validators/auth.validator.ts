/**
 * Responsibility: Define validation schemas for all Auth-related forms (Login, Forgot Password, Reset Password, Update Profile, etc.).
 * Dependency: zod.
 * Lifecycle: Stateless module.
 * Reason: Ensure type-safety and robust validation before sending data to the server or processing it in UI.
 */
import { z } from 'zod'

export const loginSchema = z.object({
  phoneNumber: z.string().min(1, 'Bắt buộc nhập số điện thoại'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional()
})

export const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(1, 'Bắt buộc nhập số điện thoại')
})

export const resetPasswordSchema = z
  .object({
    phoneNumber: z.string().min(1, 'Bắt buộc nhập số điện thoại'),
    token: z.string().min(1, 'Bắt buộc nhập mã OTP'),
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Bắt buộc xác nhận mật khẩu')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword']
  })

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Bắt buộc nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Bắt buộc xác nhận mật khẩu')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword']
  })

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Bắt buộc nhập họ và tên'),
  phone: z.string().min(1, 'Bắt buộc nhập số điện thoại')
})
