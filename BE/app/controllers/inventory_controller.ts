import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import InventoryService from '#services/inventory_service'
import {
  importInventoryValidator,
  exportInventoryValidator,
  lossReportValidator,
} from '#validators/inventory_validator'

@inject()
export default class InventoryController {
  constructor(protected inventoryService: InventoryService) {}

  /**
   * @importMaterial
   * @summary Nhập kho nguyên vật liệu
   * @description Cộng dồn số lượng nguyên vật liệu vào Tồn kho hiện tại. Tự động ghi Log Nhập kho để truy xuất nguồn gốc.
   * @requestBody <importInventoryValidator>
   * @responseBody 200 - <SuccessResponse>
   */
  async importMaterial({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(importInventoryValidator)

    const result = await this.inventoryService.importMaterial(user.id, payload)

    return response.ok({
      success: true,
      message: 'Nhập kho thành công',
      data: result,
    })
  }

  /**
   * @exportMaterial
   * @summary Xuất kho nguyên vật liệu
   * @description Trừ số lượng nguyên vật liệu khỏi Tồn kho hiện tại. Tự động ghi Log Xuất kho.
   * @requestBody <exportInventoryValidator>
   * @responseBody 200 - <SuccessResponse>
   */
  async exportMaterial({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(exportInventoryValidator)

    const result = await this.inventoryService.exportMaterial(user.id, payload)

    return response.ok({
      success: true,
      message: 'Xuất kho thành công',
      data: result,
    })
  }

  /**
   * @lossReport
   * @summary Báo cáo Tỷ lệ Hao hụt (Loss Report)
   * @description Báo cáo tổng hợp số lượng Gạo đã xuất kho so với tổng số lượng Bún đã bán ra trong một khoảng thời gian.
   * @paramQuery startDate - Ngày bắt đầu
   * @paramQuery endDate - Ngày kết thúc
   * @responseBody 200 - <LossReportResponse>
   */
  async lossReport({ request, response }: HttpContext) {
    const payload = await request.validateUsing(lossReportValidator)

    const data = await this.inventoryService.getLossReport({
      startDate: payload.startDate,
      endDate: payload.endDate,
    })

    return response.ok({
      success: true,
      message: 'Lấy báo cáo hao hụt thành công',
      data,
    })
  }
}
