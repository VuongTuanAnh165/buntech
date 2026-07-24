import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DriverRouteService from '#services/driver_route_service'

@inject()
export default class DriverRoutesController {
  constructor(protected driverRouteService: DriverRouteService) {}

  /**
   * @getTodayRoutes
   * @summary Lấy lộ trình giao hàng (Tài xế)
   * @description Lấy danh sách các đơn hàng cần giao trong ngày của tài xế đang đăng nhập. Sắp xếp tự động theo thứ tự giao hàng (routeOrder).
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Order"}]}
   */
  async getTodayRoutes({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Đảm bảo chỉ user có role giao hàng mới được gọi, hoặc check theo driverId.
    // Vì middleware auth đã bọc, ta lấy user.id làm driverId.
    const routes = await this.driverRouteService.getTodayRoutes(user.id)

    return response.ok({
      success: true,
      message: 'Lấy danh sách lộ trình giao hàng thành công',
      data: routes,
    })
  }
}
