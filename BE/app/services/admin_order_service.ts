import Order from '#models/order'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { OrderSource } from '#enums/order_source'
import { OrderStatus } from '#enums/order_status'
import { Pagination } from '#enums/pagination'
import { inject } from '@adonisjs/core'
import OrderCalculatorService from '#services/order_calculator_service'

@inject()
export default class AdminOrderService {
  constructor(protected orderCalculator: OrderCalculatorService) {}
  /**
   * Lấy danh sách Order (Admin)
   */
  async getOrders(
    page: number = 1,
    limit: number = Pagination.DEFAULT_LIMIT,
    filters?: { status?: string; userId?: number; driverId?: number }
  ) {
    const query = Order.query()
      .select('id', 'user_id', 'driver_id', 'total_amount', 'status', 'created_at')
      .preload('user', (q) => q.select('id', 'full_name', 'phone_number'))
      .preload('driver', (q) => q.select('id', 'full_name', 'phone_number'))
      .orderBy('created_at', 'desc')

    if (filters?.status) {
      query.where('status', filters.status)
    }
    if (filters?.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters?.driverId) {
      query.where('driver_id', filters.driverId)
    }

    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT || 100)
    return query.paginate(page, safeLimit)
  }

  /**
   * Lấy chi tiết Order
   */
  async getOrder(id: number) {
    return Order.query()
      .where('id', id)
      .select(
        'id',
        'user_id',
        'driver_id',
        'shipping_address_id',
        'total_amount',
        'status',
        'note',
        'delivery_date',
        'created_at',
        'updated_at'
      )
      .preload('user', (q) => q.select('id', 'full_name', 'phone_number'))
      .preload('driver', (q) => q.select('id', 'full_name', 'phone_number'))
      .preload('items', (q) => {
        q.select('id', 'order_id', 'product_id', 'quantity', 'unit_price').preload(
          'product',
          (pq) => pq.select('id', 'name', 'unit', 'base_price')
        )
      })
      .firstOrFail()
  }

  /**
   * Tạo Order cho Khách Sỉ (Áp dụng Bảng Giá Riêng)
   */
  async createOrder(data: {
    userId: number
    shippingAddressId: number
    note?: string
    deliveryDate?: Date
    items: Array<{ productId: number; quantity: number }>
  }) {
    const { totalAmount, orderItemsData } = await this.orderCalculator.calculateOrder(
      data.items,
      data.userId
    )

    // 4. DB Transaction
    return await db.transaction(async (trx) => {
      const order = new Order()
      order.userId = data.userId
      order.shippingAddressId = data.shippingAddressId
      order.source = OrderSource.ADMIN
      order.status = OrderStatus.PENDING
      order.totalAmount = totalAmount.toString()
      order.note = data.note || null
      order.deliveryDate = data.deliveryDate
        ? DateTime.fromJSDate(data.deliveryDate)
        : DateTime.now()

      order.useTransaction(trx)
      await order.save()

      const itemsToCreate = orderItemsData.map((itemData) => ({
        orderId: order.id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
      }))
      await OrderItem.createMany(itemsToCreate, { client: trx })

      return order
    })
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateStatus(
    orderId: number,
    data: {
      status?: string
      deliveryStatus?: string
      paymentStatus?: string
    }
  ) {
    const order = await Order.query()
      .select('id', 'status', 'delivery_status', 'payment_status')
      .where('id', orderId)
      .firstOrFail()
    order.merge(data)
    await order.save()
    return order
  }

  /**
   * Gán tài xế hàng loạt
   */
  async batchAssignDriver(
    driverId: number,
    orders: Array<{ orderId: number; routeOrder: number }>
  ) {
    return await db.transaction(async (trx) => {
      const orderIds = orders.map((o) => o.orderId)
      const existingOrders = await Order.query({ client: trx })
        .select('id', 'driver_id', 'route_order', 'status')
        .whereIn('id', orderIds)

      const updatePromises = existingOrders.map((order) => {
        const matchingInput = orders.find((o) => o.orderId === order.id)
        if (!matchingInput) return Promise.resolve()

        order.driverId = driverId
        order.routeOrder = matchingInput.routeOrder

        // Status might move from PENDING/PROCESSING to DELIVERING
        if (order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) {
          order.status = OrderStatus.DELIVERING
        }

        order.useTransaction(trx)
        return order.save()
      })
      await Promise.all(updatePromises)
    })
  }
}
