import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import PublicOrderService from '#services/public_order_service'
import { quickOrderValidator } from '#validators/public_order_validator'

@inject()
export default class PublicOrdersController {
  constructor(protected publicOrderService: PublicOrderService) {}

  /**
   * @summary Đặt hàng nhanh (Lead Generation)
   * @description Dành cho khách lẻ vãng lai không cần đăng nhập. Có Honeypot để chống Bot và Rate limit.
   * @requestBody {"fullName": "string", "phoneNumber": "string", "address": "string", "note": "string", "website_url": "string", "items": [{"productId": 1, "quantity": 1}]}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"orderId": 1, "totalAmount": "100000"}}
   * @responseBody 400 - {"success": false, "message": "Lỗi dữ liệu hoặc Bot detected"}
   */
  async quickOrder({ request, response }: HttpContext) {
    const payload = await request.validateUsing(quickOrderValidator)

    // Honeypot check
    if (payload.website_url) {
      // It's a bot!
      return response.badRequest({
        success: false,
        message: 'Invalid request',
      })
    }

    const order = await this.publicOrderService.createQuickOrder({
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      note: payload.note,
      items: payload.items,
    })

    return response.created({
      success: true,
      message: 'Đặt hàng thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      data: {
        orderId: order.id,
        totalAmount: order.totalAmount,
      },
    })
  }
}
