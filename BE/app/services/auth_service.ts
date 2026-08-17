import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import PasswordReset from '#models/password_reset'
import UserProfile from '#models/user_profile'
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
    const user = await User.query()
      .select('id', 'password', 'phone_number', 'full_name', 'role')
      .where('phone_number', phoneNumber)
      .first()
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

    let createdAccessTokenId: string | number | BigInt | undefined

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
        user: user,
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
    const refreshTokenRecord = await RefreshToken.query()
      .select('id', 'user_id', 'token', 'expires_at', 'is_revoked')
      .where('token', tokenString)
      .first()

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
    const user = await User.query()
      .select('id', 'phone_number', 'password', 'full_name', 'role')
      .where('id', refreshTokenRecord.userId)
      .firstOrFail()

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

  /**
   * Yêu cầu quên mật khẩu (Tạo OTP)
   */
  public async forgotPassword(phoneNumber: string) {
    const user = await User.query().where('phone_number', phoneNumber).first()
    if (!user) {
      // Do not reveal if user exists or not for security, but we need to return something
      return { success: true, message: 'Nếu số điện thoại tồn tại, mã OTP đã được gửi' }
    }

    // Xóa OTP cũ nếu có
    await PasswordReset.query().where('phone_number', phoneNumber).delete()

    const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6 digits

    await PasswordReset.create({
      phoneNumber,
      token: otp,
      expiresAt: DateTime.now().plus({ minutes: 15 }),
    })

    // In a real app, send OTP via SMS here
    // For now, we will return the OTP in the response just for development purpose
    return {
      success: true,
      message: 'Mã xác thực đã được gửi',
      otp: app.inProduction ? undefined : otp,
    }
  }

  /**
   * Khôi phục mật khẩu (Sử dụng OTP)
   */
  public async resetPassword(phoneNumber: string, token: string, newPasswordText: string) {
    const resetRecord = await PasswordReset.query()
      .where('phone_number', phoneNumber)
      .where('token', token)
      .first()

    if (!resetRecord) {
      throw new BusinessException('Mã xác thực không chính xác', HttpStatus.BAD_REQUEST)
    }

    if (resetRecord.expiresAt < DateTime.now()) {
      throw new BusinessException('Mã xác thực đã hết hạn', HttpStatus.BAD_REQUEST)
    }

    const user = await User.query().where('phone_number', phoneNumber).firstOrFail()
    user.password = newPasswordText
    await user.save()

    await resetRecord.delete()
  }

  /**
   * Đổi mật khẩu (Cho user đang đăng nhập)
   */
  public async changePassword(userId: number, oldPasswordText: string, newPasswordText: string) {
    const user = await User.findOrFail(userId)

    const isPasswordValid = await hash.verify(user.password, oldPasswordText)
    if (!isPasswordValid) {
      throw new BusinessException('Mật khẩu cũ không chính xác', HttpStatus.BAD_REQUEST)
    }

    user.password = newPasswordText
    await user.save()

    // Thu hồi toàn bộ Access Tokens để ép đăng nhập lại?
    // Có thể thực hiện nếu hệ thống yêu cầu bảo mật cao, tạm thời không bắt buộc.
  }

  /**
   * Cập nhật Profile (Cho user đang đăng nhập)
   */
  public async updateProfile(userId: number, fullName: string, avatarUrl?: string) {
    const trx = await db.transaction()
    try {
      const user = await User.findOrFail(userId, { client: trx })
      user.fullName = fullName
      await user.save()

      if (avatarUrl !== undefined) {
        let profile = await UserProfile.query({ client: trx }).where('user_id', userId).first()
        if (profile) {
          profile.avatarUrl = avatarUrl
          await profile.save()
        } else {
          profile = new UserProfile()
          profile.useTransaction(trx)
          profile.userId = userId
          profile.avatarUrl = avatarUrl
          await profile.save()
        }
      }

      await trx.commit()

      // Return updated user payload
      await user.load('profile')
      return user
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
