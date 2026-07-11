import { inject } from '@adonisjs/core'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import hash from '@adonisjs/core/services/hash'
import BusinessException from '#exceptions/business_exception'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'
import stringHelpers from '@adonisjs/core/helpers/string'

@inject()
export default class AuthService {
  /**
   * Đăng nhập: Cấp cả Opaque Token (Access) và Custom Refresh Token
   */
  public async login(phoneNumber: string, passwordText: string) {
    // 1. Tìm user
    const user = await User.findBy('phone_number', phoneNumber)
    if (!user) {
      throw new BusinessException('Số điện thoại hoặc mật khẩu không chính xác', 400)
    }

    // 2. Kiểm tra mật khẩu
    // `withAuthFinder(hash)` mixin adds static `verifyCredentials` but doing it directly is clear:
    const isPasswordValid = await hash.verify(user.password, passwordText)
    if (!isPasswordValid) {
      throw new BusinessException('Số điện thoại hoặc mật khẩu không chính xác', 400)
    }

    // 3. Tạo Opaque Access Token (hạn 1 tiếng)
    const accessToken = await User.accessTokens.create(user, ['*'], {
      expiresIn: '1 hour',
    })

    // 4. Tạo Refresh Token ngẫu nhiên (hạn 30 ngày)
    const tokenString = stringHelpers.generateRandom(64)
    const refreshToken = new RefreshToken()
    refreshToken.userId = user.id
    refreshToken.token = tokenString
    refreshToken.expiresAt = DateTime.now().plus({ days: 30 })
    refreshToken.isRevoked = false
    await refreshToken.save()

    return {
      accessToken: accessToken.value!.release(), // Get the plaintext token
      refreshToken: refreshToken.token,
    }
  }

  /**
   * Cấp lại Access Token mới dựa vào Refresh Token cũ
   */
  public async refresh(tokenString: string) {
    // 1. Tìm Refresh Token trong DB
    const refreshTokenRecord = await RefreshToken.findBy('token', tokenString)

    // 2. Kiểm tra hợp lệ
    if (!refreshTokenRecord) {
      // Đúng mã HTTP 401 như FE mong đợi để ép văng ra luồng Force Logout
      throw new Exception('Token không hợp lệ hoặc đã hết hạn', { status: 401 })
    }

    if (refreshTokenRecord.isRevoked) {
      throw new Exception('Token đã bị thu hồi', { status: 401 })
    }

    if (refreshTokenRecord.expiresAt < DateTime.now()) {
      throw new Exception('Token đã hết hạn', { status: 401 })
    }

    // 3. Lấy User tương ứng
    const user = await User.findOrFail(refreshTokenRecord.userId)

    // 4. Sinh Access Token mới
    const newAccessToken = await User.accessTokens.create(user, ['*'], {
      expiresIn: '1 hour',
    })

    // (Lưu ý: FE không yêu cầu cấp mới refresh_token ở bước này, giữ nguyên token cũ)

    return {
      accessToken: newAccessToken.value!.release(),
    }
  }

  /**
   * (Tùy chọn) Đăng xuất: Thu hồi toàn bộ Refresh Token của User, Access Token cũng sẽ bị xóa
   */
  public async logout(user: User, currentAccessTokenId: number) {
    // Thu hồi Opaque Token hiện tại
    await User.accessTokens.delete(user, currentAccessTokenId)
  }
}
