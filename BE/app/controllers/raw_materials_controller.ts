import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RawMaterialService from '#services/raw_material_service'
import {
  createRawMaterialValidator,
  updateRawMaterialValidator,
} from '#validators/raw_material_validator'

@inject()
export default class RawMaterialsController {
  constructor(protected rawMaterialService: RawMaterialService) {}

  /**
   * @summary Danh sách nguyên vật liệu
   * @description Lấy danh sách nguyên vật liệu, hỗ trợ tìm kiếm và phân trang.
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"meta": {}, "data": [{"id": 1, "name": "string", "unit": "string", "currentStock": "string", "createdAt": "string"}]}}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search')

    const rawMaterials = await this.rawMaterialService.getRawMaterials(page, limit, search)

    return response.ok({
      success: true,
      message: 'Lấy danh sách nguyên vật liệu thành công',
      data: rawMaterials,
    })
  }

  /**
   * @summary Chi tiết nguyên vật liệu
   * @paramPath id - ID nguyên vật liệu
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1, "name": "string", "unit": "string", "currentStock": "string", "createdAt": "string"}}
   */
  async show({ params, response }: HttpContext) {
    const rawMaterial = await this.rawMaterialService.getRawMaterial(params.id)
    return response.ok({
      success: true,
      message: 'Lấy thông tin nguyên vật liệu thành công',
      data: rawMaterial,
    })
  }

  /**
   * @summary Tạo mới nguyên vật liệu
   * @requestBody {"name": "Gạo ST25", "unit": "kg", "currentStock": 0}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"id": 1, "name": "string", "unit": "string", "currentStock": "string", "createdAt": "string"}}
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRawMaterialValidator)
    const rawMaterial = await this.rawMaterialService.createRawMaterial(payload)

    return response.created({
      success: true,
      message: 'Tạo nguyên vật liệu thành công',
      data: rawMaterial,
    })
  }

  /**
   * @summary Cập nhật nguyên vật liệu
   * @paramPath id - ID nguyên vật liệu
   * @requestBody {"name": "Gạo ST25", "unit": "kg", "currentStock": 0}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1, "name": "string", "unit": "string", "currentStock": "string", "createdAt": "string"}}
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateRawMaterialValidator)
    const rawMaterial = await this.rawMaterialService.updateRawMaterial(params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật nguyên vật liệu thành công',
      data: rawMaterial,
    })
  }

  /**
   * @summary Xóa nguyên vật liệu
   * @description Xóa mềm nguyên vật liệu (Soft delete)
   * @paramPath id - ID nguyên vật liệu
   * @responseBody 200 - {"success": true, "message": "Thành công"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.rawMaterialService.deleteRawMaterial(params.id)

    return response.ok({
      success: true,
      message: 'Xóa nguyên vật liệu thành công',
    })
  }
}
