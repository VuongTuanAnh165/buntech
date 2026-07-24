import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import InventoryService from '#services/inventory_service'
import { importInventoryValidator } from '#validators/inventory_validator'

@inject()
export default class InventoryController {
  constructor(protected inventoryService: InventoryService) {}

  /**
   * @summary Nhập kho nguyên vật liệu
   * @description Cộng dồn số lượng nguyên vật liệu vào Tồn kho hiện tại. Tự động ghi Log Nhập kho để truy xuất nguồn gốc.
   * @requestBody {"materialId": 1, "quantity": 100, "note": "Nhập kho lô gạo tháng 7", "referenceId": "PO-123"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"material": {"id": 1, "currentStock": "string"}, "log": {"id": 1, "materialId": 1, "quantity": "string", "type": "string", "note": "string"}}}
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
}
