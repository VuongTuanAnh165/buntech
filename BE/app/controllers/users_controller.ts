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
   * @index
   * @summary Danh sách User
   * @description Lấy danh sách người dùng (chỉ dành cho Admin)
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery role - Vai trò của người dùng
   * @responseBody 200 - <PaginatedUserAdminListResponse>
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
   * @store
   * @summary Tạo User
   * @description Tạo người dùng mới và profile rỗng (chỉ dành cho Admin)
   * @requestBody <createUserValidator>
   * @responseBody 201 - <UserAdminDetailResponse>
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
   * @show
   * @summary Chi tiết User
   * @description Lấy thông tin chi tiết một người dùng
   * @paramPath id - ID người dùng
   * @responseBody 200 - <UserAdminDetailResponse>
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
   * @update
   * @summary Cập nhật User
   * @description Cập nhật thông tin (tên, role) của người dùng
   * @paramPath id - ID người dùng
   * @requestBody <updateUserValidator>
   * @responseBody 200 - <UserAdminDetailResponse>
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
   * @changePassword
   * @summary Đổi mật khẩu
   * @description Admin đặt lại mật khẩu cho người dùng
   * @paramPath id - ID người dùng
   * @requestBody <changePasswordValidator>
   * @responseBody 200 - <SuccessResponse>
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
   * @destroy
   * @summary Xóa User
   * @description Xóa tài khoản người dùng
   * @paramPath id - ID người dùng
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response }: HttpContext) {
    await this.userService.deleteUser(params.id)

    return response.ok({
      success: true,
      message: 'Xóa người dùng thành công',
    })
  }
  /**
   * @updateProfile
   * @summary Cập nhật Profile
   * @description Admin cập nhật hạn mức nợ (debt_limit) và thông tin cửa hàng
   * @paramPath id - ID người dùng
   * @requestBody <updateUserProfileValidator>
   * @responseBody 200 - <UserProfileResponse>
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
