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
        .select(
          'id',
          'user_id',
          'shipping_address_id',
          'total_amount',
          'status',
          'delivery_status',
          'payment_status',
          'route_order',
          'delivery_date',
          'note'
        )
        .where('driver_id', driverId)
        // Lấy các đơn hàng có lịch giao từ hôm nay trở về trước (có thể đơn cũ chưa giao)
        .where('delivery_date', '<=', today.toSQLDate() as string)
        // Loại bỏ các đơn hàng đã hủy hoặc đã giao xong
        .whereNotIn('status', ['CANCELED', 'DELIVERED'])
        // Sắp xếp ưu tiên: Theo ngày giao, sau đó theo thứ tự routeOrder
        .orderBy('delivery_date', 'asc')
        .orderBy('route_order', 'asc')
        .preload('shippingAddress', (q) =>
          q.select(
            'id',
            'address_line',
            'ward',
            'district',
            'province',
            'phone_number',
            'recipient_name'
          )
        )
        .preload('user', (q) => q.select('id', 'fullName', 'phoneNumber'))
        .preload('items', (q) => {
          q.select('id', 'order_id', 'product_id', 'quantity').preload('product', (pq) =>
            pq.select('id', 'name', 'thumbnailUrl')
          )
        })
    )
  }
}
