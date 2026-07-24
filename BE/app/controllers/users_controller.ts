import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import UserService from '#services/user_service'
import {
  createUserValidator,
  updateUserValidator,
  changePasswordValidator,
  updateUserProfileValidator,
} from '#validators/user_validator'

@inject()
export default class UsersController {
  constructor(protected userService: UserService) {}

  /**
   * @summary Danh sách User
   * @description Lấy danh sách người dùng (chỉ dành cho Admin)
   * @paramUse(sortable, filterable)
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"meta": {}, "data": [{"id": 1, "fullName": "string", "phoneNumber": "string", "role": "string", "createdAt": "string", "profile": {"userId": 1, "avatarUrl": "string", "storeName": "string", "debtLimit": "string", "currentDebt": "string"}}]}}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const role = request.input('role')

    const users = await this.userService.getUsers(page, limit, role)

    return response.ok({
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      data: users,
    })
  }

  /**
   * @summary Tạo User
   * @description Tạo người dùng mới và profile rỗng (chỉ dành cho Admin)
   * @requestBody {"phoneNumber": "string", "password": "password", "fullName": "string", "role": "ADMIN|DRIVER|WHOLESALE|RETAIL|GUEST"}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"id": 1, "fullName": "string", "phoneNumber": "string", "role": "string"}}
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const user = await this.userService.createUser(payload)

    return response.created({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user,
    })
  }

  /**
   * @summary Chi tiết User
   * @description Lấy thông tin chi tiết một người dùng
   * @paramPath id - ID người dùng
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1, "fullName": "string", "phoneNumber": "string", "role": "string", "createdAt": "string", "profile": {"userId": 1, "avatarUrl": "string", "storeName": "string", "debtLimit": "string", "currentDebt": "string"}}}
   */
  async show({ params, response }: HttpContext) {
    const user = await this.userService.getUser(params.id)

    return response.ok({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    })
  }

  /**
   * @summary Cập nhật User
   * @description Cập nhật thông tin (tên, role) của người dùng
   * @paramPath id - ID người dùng
   * @requestBody {"fullName": "string", "role": "string"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1, "fullName": "string", "phoneNumber": "string", "role": "string"}}
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const user = await this.userService.updateUser(params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: user,
    })
  }

  /**
   * @summary Đổi mật khẩu
   * @description Admin đặt lại mật khẩu cho người dùng
   * @paramPath id - ID người dùng
   * @requestBody {"password": "new_password"}
   * @responseBody 200 - {"success": true, "message": "Thành công"}
   */
  async changePassword({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(changePasswordValidator)
    await this.userService.changePassword(params.id, payload.password)

    return response.ok({
      success: true,
      message: 'Đổi mật khẩu thành công',
    })
  }

  /**
   * @summary Xóa User
   * @description Xóa tài khoản người dùng
   * @paramPath id - ID người dùng
   * @responseBody 200 - {"success": true, "message": "Thành công"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.userService.deleteUser(params.id)

    return response.ok({
      success: true,
      message: 'Xóa người dùng thành công',
    })
  }
  /**
   * @summary Cập nhật Profile
   * @description Admin cập nhật hạn mức nợ (debt_limit) và thông tin cửa hàng
   * @paramPath id - ID người dùng
   * @requestBody {"debtLimit": 10000000, "storeName": "Cửa hàng A", "zaloUserId": "string", "avatarUrl": "string"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {}}
   */
  async updateProfile({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserProfileValidator)
    const profile = await this.userService.updateProfile(params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: profile,
    })
  }
}
