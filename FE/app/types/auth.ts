export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}
