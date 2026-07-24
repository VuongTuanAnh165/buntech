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
   * @index
   * @summary Danh sách nguyên vật liệu
   * @description Lấy danh sách nguyên vật liệu, hỗ trợ tìm kiếm và phân trang.
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery search - Từ khóa tìm kiếm
   * @responseBody 200 - <PaginatedRawMaterialListResponse>
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
   * @show
   * @summary Chi tiết nguyên vật liệu
   * @paramPath id - ID nguyên vật liệu
   * @responseBody 200 - <RawMaterialResponse>
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
   * @store
   * @summary Tạo mới nguyên vật liệu
   * @requestBody <createRawMaterialValidator>
   * @responseBody 201 - <RawMaterialResponse>
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
   * @update
   * @summary Cập nhật nguyên vật liệu
   * @paramPath id - ID nguyên vật liệu
   * @requestBody <updateRawMaterialValidator>
   * @responseBody 200 - <RawMaterialResponse>
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
   * @destroy
   * @summary Xóa nguyên vật liệu
   * @description Xóa mềm nguyên vật liệu (Soft delete)
   * @paramPath id - ID nguyên vật liệu
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response }: HttpContext) {
    await this.rawMaterialService.deleteRawMaterial(params.id)

    return response.ok({
      success: true,
      message: 'Xóa nguyên vật liệu thành công',
    })
  }
}
