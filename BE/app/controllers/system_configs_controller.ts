import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import SystemConfigService from '#services/system_config_service'
import {
  createSystemConfigValidator,
  updateSystemConfigValidator,
} from '#validators/system_config_validator'

@inject()
export default class SystemConfigsController {
  constructor(protected systemConfigService: SystemConfigService) {}

  /**
   * @summary Lấy danh sách cấu hình hệ thống
   * @description Trả về danh sách cấu hình động của hệ thống (có phân trang)
   * @paramUse(sortable, filterable)
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"meta": {}, "data": [{"key": "string", "value": "string", "description": "string", "createdAt": "string"}]}}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 100)
    const configs = await this.systemConfigService.getConfigs(page, limit)

    return response.ok({
      success: true,
      message: 'Lấy danh sách cấu hình hệ thống thành công',
      data: configs,
    })
  }

  /**
   * @summary Tạo cấu hình mới
   * @description Thêm một key-value cấu hình hệ thống
   * @requestBody {"key": "string", "value": "string", "description": "string"}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"key": "string", "value": "string", "description": "string", "createdAt": "string", "updatedAt": "string"}}
   * @responseBody 400 - {"success": false, "message": "Lỗi validate hoặc key đã tồn tại"}
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
   * @summary Chi tiết cấu hình
   * @description Lấy chi tiết một cấu hình hệ thống theo key
   * @paramPath id - Key của cấu hình
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"key": "string", "value": "string", "description": "string"}}
   * @responseBody 404 - {"success": false, "message": "Không tìm thấy cấu hình"}
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
   * @summary Cập nhật cấu hình
   * @description Thay đổi giá trị của cấu hình hiện tại
   * @paramPath id - Key của cấu hình
   * @requestBody {"value": "string", "description": "string"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"key": "string", "value": "string", "description": "string"}}
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
   * @summary Xóa cấu hình
   * @description Xóa vĩnh viễn cấu hình hệ thống
   * @paramPath id - Key của cấu hình
   * @responseBody 200 - {"success": true, "message": "Xóa thành công"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.systemConfigService.deleteConfig(params.id)

    return response.ok({
      success: true,
      message: 'Xóa cấu hình thành công',
    })
  }
}
