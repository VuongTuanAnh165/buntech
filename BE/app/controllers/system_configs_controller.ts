import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import SystemConfigService from '#services/system_config_service'
import {
  createSystemConfigValidator,
  updateSystemConfigValidator,
} from '#validators/system_config_validator'
import { paginationValidator } from '#validators/pagination'
import { Pagination } from '#enums/pagination'
import { formatPagination } from '#utils/pagination'

@inject()
export default class SystemConfigsController {
  constructor(protected systemConfigService: SystemConfigService) {}

  /**
   * @index
   * @summary Lấy danh sách cấu hình hệ thống
   * @description Trả về danh sách cấu hình động của hệ thống (có phân trang)
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng cấu hình
   * @responseBody 200 - <PaginatedSystemConfigListResponse>
   */
  async index({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })
    const search = request.input('search')

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const configs = await this.systemConfigService.getConfigs(pageNum, limitNum, search)

    return response.ok({
      success: true,
      message: 'Lấy danh sách cấu hình hệ thống thành công',
      data: formatPagination(configs),
    })
  }

  /**
   * @store
   * @summary Tạo cấu hình mới
   * @description Thêm một key-value cấu hình hệ thống
   * @requestBody <createSystemConfigValidator>
   * @responseBody 201 - <SystemConfigListResponse>
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createSystemConfigValidator)

    const config = await this.systemConfigService.createConfig(payload)
    return response.created({
      success: true,
      message: 'Tạo cấu hình hệ thống thành công',
      data: config,
    })
  }

  /**
   * @show
   * @summary Chi tiết cấu hình
   * @description Lấy chi tiết một cấu hình hệ thống theo key
   * @paramPath id - Key của cấu hình
   * @responseBody 200 - <SystemConfigListResponse>
   */
  async show({ params, response }: HttpContext) {
    const config = await this.systemConfigService.getConfig(params.id)

    return response.ok({
      success: true,
      message: 'Lấy thông tin cấu hình thành công',
      data: config,
    })
  }

  /**
   * @update
   * @summary Cập nhật cấu hình
   * @description Thay đổi giá trị của cấu hình hiện tại
   * @paramPath id - Key của cấu hình
   * @requestBody <updateSystemConfigValidator>
   * @responseBody 200 - <SystemConfigListResponse>
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateSystemConfigValidator)
    const config = await this.systemConfigService.updateConfig(params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật cấu hình thành công',
      data: config,
    })
  }

  /**
   * @destroy
   * @summary Xóa cấu hình
   * @description Xóa vĩnh viễn cấu hình hệ thống
   * @paramPath id - Key của cấu hình
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response }: HttpContext) {
    await this.systemConfigService.deleteConfig(params.id)

    return response.ok({
      success: true,
      message: 'Xóa cấu hình thành công',
    })
  }
}
