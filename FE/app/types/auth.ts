import type { CurrentUser } from './common'

export interface LoginPayload {
  phoneNumber: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: CurrentUser
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface ForgotPasswordPayload {
  phoneNumber: string
}

export interface ResetPasswordPayload {
  phoneNumber: string
  token: string
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface UpdateProfilePayload {
  fullName: string
  avatarUrl?: string
}
