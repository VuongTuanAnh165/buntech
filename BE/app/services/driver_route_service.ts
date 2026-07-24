import Order from '#models/order'
import { DateTime } from 'luxon'

export default class DriverRouteService {
  /**
   * Lấy danh sách lộ trình giao hàng trong ngày của Tài xế
   */
  async getTodayRoutes(driverId: number) {
    const today = DateTime.now().startOf('day')

    return (
      Order.query()
        .where('driver_id', driverId)
        // Lấy các đơn hàng có lịch giao từ hôm nay trở về trước (có thể đơn cũ chưa giao)
        .where('delivery_date', '<=', today.toSQLDate() as string)
        // Loại bỏ các đơn hàng đã hủy hoặc đã giao xong
        .whereNotIn('status', ['CANCELED', 'DELIVERED'])
        // Sắp xếp ưu tiên: Theo ngày giao, sau đó theo thứ tự routeOrder
        .orderBy('delivery_date', 'asc')
        .orderBy('route_order', 'asc')
        .preload('shippingAddress')
        .preload('user')
        .preload('items', (q) => {
          q.preload('product')
        })
    )
  }
}
