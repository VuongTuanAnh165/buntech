import { inject } from '@adonisjs/core'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import hash from '@adonisjs/core/services/hash'
import BusinessException from '#exceptions/business_exception'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpStatus } from '#enums/http_status'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class AuthService {
  /**
   * Đăng nhập: Cấp cả Opaque Token (Access) và Custom Refresh Token
   */
  public async login(phoneNumber: string, passwordText: string, rememberMe?: boolean) {
    // 1. Tìm user
    const user = await User.findBy('phone_number', phoneNumber)
    if (!user) {
      throw new BusinessException(
        'Số điện thoại hoặc mật khẩu không chính xác',
        HttpStatus.BAD_REQUEST
      )
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await hash.verify(user.password, passwordText)
    if (!isPasswordValid) {
      throw new BusinessException(
        'Số điện thoại hoặc mật khẩu không chính xác',
        HttpStatus.BAD_REQUEST
      )
    }

    let createdAccessTokenId: string | number | undefined

    const trx = await db.transaction()
    try {
      // 3. Tạo Opaque Access Token (hạn 1 tiếng)
      // Lưu ý: User.accessTokens.create không nhận `trx`, nên phải rollback thủ công nếu phần sau bị lỗi
      const accessToken = await User.accessTokens.create(user, ['*'], {
        expiresIn: '1 hour',
      })
      createdAccessTokenId = accessToken.identifier

      // 4. Tạo Refresh Token ngẫu nhiên (hạn 30 ngày nếu rememberMe, ngược lại 1 ngày)
      const tokenString = stringHelpers.generateRandom(64)
      const refreshToken = new RefreshToken()
      refreshToken.useTransaction(trx)
      refreshToken.userId = user.id
      refreshToken.token = tokenString

      const expiresDays = rememberMe ? 30 : 1
      refreshToken.expiresAt = DateTime.now().plus({ days: expiresDays })
      refreshToken.isRevoked = false
      await refreshToken.save()

      await trx.commit()

      return {
        accessToken: accessToken.value!.release(), // Get the plaintext token
        refreshToken: refreshToken.token,
      }
    } catch (error) {
      await trx.rollback()
      // Application-level rollback for access token
      if (createdAccessTokenId) {
        await User.accessTokens.delete(user, createdAccessTokenId)
      }
      throw error
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
      throw new Exception('Token không hợp lệ hoặc đã hết hạn', { status: HttpStatus.UNAUTHORIZED })
    }

    if (refreshTokenRecord.isRevoked) {
      throw new Exception('Token đã bị thu hồi', { status: HttpStatus.UNAUTHORIZED })
    }

    if (refreshTokenRecord.expiresAt < DateTime.now()) {
      throw new Exception('Token đã hết hạn', { status: HttpStatus.UNAUTHORIZED })
    }

    // 3. Lấy User tương ứng
    const user = await User.findOrFail(refreshTokenRecord.userId)

    // 4. Sinh Access Token mới
    const newAccessToken = await User.accessTokens.create(user, ['*'], {
      expiresIn: '1 hour',
    })

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
