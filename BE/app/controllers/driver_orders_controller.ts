import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DriverOrderService from '#services/driver_order_service'
import { deliverOrderValidator } from '#validators/driver_order_validator'

@inject()
export default class DriverOrdersController {
  constructor(protected driverOrderService: DriverOrderService) {}

  /**
   * @summary Chốt giao hàng thành công (Tài xế)
   * @description Cập nhật đơn hàng thành DELIVERED, ghi nhận số tiền tài xế thu hộ, và tự động cập nhật Công Nợ của Khách hàng. Yêu cầu truyền `idempotencyKey` để chống double click.
   * @paramPath id - ID đơn hàng
   * @requestBody {"paymentMethod": "CASH", "amountPaid": 500000, "deliveryNote": "Khách đưa tiền mặt", "idempotencyKey": "uuid-v4-string"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {}}
   */
  async deliver({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(deliverOrderValidator)

    const order = await this.driverOrderService.deliverOrder(params.id, user.id, payload)

    return response.ok({
      success: true,
      message: 'Chốt giao hàng thành công, công nợ đã được tự động cập nhật',
      data: order,
    })
  }
}
