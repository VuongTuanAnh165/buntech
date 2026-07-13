export interface LoginPayload {
  phoneNumber: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}
