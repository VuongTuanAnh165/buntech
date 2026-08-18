import Order from '#models/order'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { OrderSource } from '#enums/order_source'
import { OrderStatus } from '#enums/order_status'
import { Pagination, getSafeLimit } from '#enums/pagination'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import OrderCalculatorService from '#services/order_calculator_service'

import Transaction from '#models/transaction'
import { TransactionType } from '#enums/transaction_type'

@inject()
export default class AdminOrderService {
  constructor(protected orderCalculator: OrderCalculatorService) {}

  private _buildQuery(filters?: {
    status?: string
    userId?: number
    driverId?: number
    search?: string
    startDate?: string
    endDate?: string
  }) {
    const query = Order.query()
      .select(
        'id',
        'user_id',
        'driver_id',
        'total_amount',
        'amount_collected',
        'status',
        'created_at'
      )
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
    if (filters?.startDate) {
      query.where('created_at', '>=', `${filters.startDate} 00:00:00`)
    }
    if (filters?.endDate) {
      query.where('created_at', '<=', `${filters.endDate} 23:59:59`)
    }
    if (filters?.search) {
      const keyword = `%${filters.search}%`
      query.where((q) => {
        q.where('id', 'like', keyword)
          .orWhereHas('user', (uq) => {
            uq.where('full_name', 'like', keyword).orWhere('phone_number', 'like', keyword)
          })
          .orWhereHas('shippingAddress', (aq) => {
            aq.where('address_line', 'like', keyword)
          })
      })
    }
    return query
  }

  /**
   * Lấy danh sách Order (Admin)
   */
  async getOrders(
    page: number = 1,
    limit: number = Pagination.DEFAULT_LIMIT,
    filters?: {
      status?: string
      userId?: number
      driverId?: number
      search?: string
      startDate?: string
      endDate?: string
    }
  ) {
    const query = this._buildQuery(filters)

    const safeLimit = getSafeLimit(limit)
    return query.paginate(page, safeLimit)
  }

  /**
   * Xuất danh sách Order (Admin) dưới dạng chunk stream generator
   */
  async *getOrdersExportGenerator(
    filters?: Parameters<typeof this._buildQuery>[0],
    chunkSize: number = 500
  ) {
    const baseQuery = this._buildQuery(filters)
    let page = 1
    let hasMore = true

    while (hasMore) {
      // Chunking by pagination to avoid Memory Spike
      const chunk = await baseQuery.clone().paginate(page, chunkSize)
      if (chunk.all().length === 0) {
        hasMore = false
        break
      }
      yield chunk.all()
      if (chunk.currentPage >= chunk.lastPage) {
        hasMore = false
      }
      page++
    }
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
        'amount_collected',
        'delivery_fee',
        'status',
        'note',
        'delivery_date',
        'created_at',
        'updated_at'
      )
      .preload('user', (q) => q.select('id', 'full_name', 'phone_number'))
      .preload('driver', (q) => q.select('id', 'full_name', 'phone_number'))
      .preload('shippingAddress', (q) =>
        q.select('id', 'user_id', 'province', 'ward', 'address_line', 'is_default')
      )
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
    deliveryFee?: number
    amountCollected?: number
    items: Array<{ productId: number; quantity: number }>
  }) {
    const { totalAmount, orderItemsData } = await this.orderCalculator.calculateOrder(
      data.items,
      data.userId
    )

    const finalTotal = totalAmount + (data.deliveryFee || 0)

    // 4. DB Transaction
    return await db.transaction(async (trx) => {
      const order = new Order()
      order.userId = data.userId
      order.shippingAddressId = data.shippingAddressId
      order.source = OrderSource.ADMIN
      order.status = OrderStatus.PENDING
      order.deliveryFee = (data.deliveryFee || 0).toString()
      order.amountCollected = (data.amountCollected || 0).toString()
      order.totalAmount = finalTotal.toString()
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

      // Handle Debt and Transactions
      const amountCollected = data.amountCollected || 0
      const debtIncrease = finalTotal - amountCollected

      if (debtIncrease !== 0) {
        await db
          .from('user_profiles')
          .where('user_id', data.userId)
          .update({
            current_debt: db.raw('current_debt + ?', [debtIncrease]),
            updated_at: DateTime.now().toSQL(),
          })
          .useTransaction(trx)
      }

      if (finalTotal > 0) {
        const chargeTx = new Transaction()
        chargeTx.userId = data.userId
        chargeTx.orderId = order.id
        chargeTx.amount = finalTotal.toString()
        chargeTx.type = TransactionType.ORDER_CHARGE
        chargeTx.paymentMethod = 'SYSTEM'
        chargeTx.transactionDate = DateTime.now()
        chargeTx.useTransaction(trx)
        await chargeTx.save()
      }

      if (amountCollected > 0) {
        const paymentTx = new Transaction()
        paymentTx.userId = data.userId
        paymentTx.orderId = order.id
        paymentTx.amount = amountCollected.toString()
        paymentTx.type = TransactionType.ORDER_PAYMENT
        paymentTx.paymentMethod = 'CASH' // Mặc định là CASH nếu thu ngay
        paymentTx.transactionDate = DateTime.now()
        paymentTx.useTransaction(trx)
        await paymentTx.save()
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
      updatedAt?: string
    }
  ) {
    const order = await Order.query()
      .select('id', 'status', 'delivery_status', 'payment_status', 'updated_at')
      .where('id', orderId)
      .firstOrFail()

    if (data.updatedAt && order.updatedAt?.toISO() !== data.updatedAt) {
      throw new Exception('Data has been modified by another transaction', {
        code: 'E_OPTIMISTIC_LOCK',
        status: 409,
      })
    }

    // Xóa trường updatedAt ra khỏi data trước khi merge để Adonis tự sinh ngày mới
    const { updatedAt, ...updateData } = data

    order.merge(updateData)
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

      for (const order of existingOrders) {
        const matchingInput = orders.find((o) => o.orderId === order.id)
        if (!matchingInput) continue

        order.driverId = driverId
        order.routeOrder = matchingInput.routeOrder

        // Status might move from PENDING/PROCESSING to DELIVERING
        if (order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) {
          order.status = OrderStatus.DELIVERING
        }

        order.useTransaction(trx)
        await order.save()
      }
    })
  }
}
