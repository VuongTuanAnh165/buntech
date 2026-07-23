import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import CustomerPrice from '#models/customer_price'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class AdminOrderService {
  /**
   * Lấy danh sách Order (Admin)
   */
  async getOrders(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; userId?: number; driverId?: number }
  ) {
    const query = Order.query().preload('user').preload('driver').orderBy('created_at', 'desc')

    if (filters?.status) {
      query.where('status', filters.status)
    }
    if (filters?.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters?.driverId) {
      query.where('driver_id', filters.driverId)
    }

    return query.paginate(page, limit)
  }

  /**
   * Lấy chi tiết Order
   */
  async getOrder(id: number) {
    return Order.query()
      .where('id', id)
      .preload('user')
      .preload('driver')
      .preload('items', (q) => {
        q.preload('product')
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
    // 1. Fetch Products
    const productIds = data.items.map((i) => i.productId)
    const products = await Product.query().whereIn('id', productIds)

    // 2. Fetch Custom Prices for this User
    const customPrices = await CustomerPrice.query()
      .where('user_id', data.userId)
      .whereIn('product_id', productIds)

    let totalAmount = 0
    const orderItemsData: Array<{ productId: number; quantity: number; unitPrice: number }> = []

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product || !product.isActive) {
        throw new Error(`Sản phẩm ID ${item.productId} không tồn tại hoặc đã ngừng bán`)
      }

      // 3. Determine Price (Priority: CustomerPrice > BasePrice)
      const customPrice = customPrices.find((cp) => cp.productId === item.productId)
      const unitPrice = customPrice
        ? Number.parseFloat(customPrice.customPrice)
        : Number.parseFloat(product.basePrice)

      totalAmount += unitPrice * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
      })
    }

    // 4. DB Transaction
    return await db.transaction(async (trx) => {
      const order = new Order()
      order.userId = data.userId
      order.shippingAddressId = data.shippingAddressId
      order.source = 'ADMIN'
      order.status = 'PENDING'
      order.totalAmount = totalAmount.toString()
      order.note = data.note || null
      order.deliveryDate = data.deliveryDate
        ? DateTime.fromJSDate(data.deliveryDate)
        : DateTime.now()

      order.useTransaction(trx)
      await order.save()

      for (const itemData of orderItemsData) {
        const orderItem = new OrderItem()
        orderItem.orderId = order.id
        orderItem.productId = itemData.productId
        orderItem.quantity = itemData.quantity
        orderItem.unitPrice = itemData.unitPrice
        orderItem.useTransaction(trx)
        await orderItem.save()
      }

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
    const order = await Order.findOrFail(orderId)
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
      for (const item of orders) {
        const order = await Order.query({ client: trx }).where('id', item.orderId).firstOrFail()

        order.driverId = driverId
        order.routeOrder = item.routeOrder
        // Status might move from PENDING/PROCESSING to DELIVERING
        if (order.status === 'PENDING' || order.status === 'PROCESSING') {
          order.status = 'DELIVERING'
        }

        order.useTransaction(trx)
        await order.save()
      }
    })
  }
}
