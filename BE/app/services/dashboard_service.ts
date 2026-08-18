import { inject } from '@adonisjs/core'
import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status'

interface DashboardFilters {
  startDate?: Date
  endDate?: Date
}

interface TopBuyersFilters {
  startDate?: Date
  endDate?: Date
  limit: number
  sortBy: 'revenue' | 'quantity'
}

interface AggregateRow {
  [key: string]: string | number | null
}

interface OrderStatusRow {
  status: string
  $extras: { count: string | number }
}

interface RevenueChartRow {
  date: string
  value: string | number
  ordersCount: string | number
}

interface TopProductRow {
  name: string
  totalValue: string | number
}

interface TopBuyerRow {
  userId: number
  fullName: string
  phoneNumber: string
  totalRevenue: string | number
  ordersCount: string | number
  totalQuantity: string | number
}

@inject()
export default class DashboardService {
  /**
   * Parse Date object thành SQL Date string
   */
  private parseDate(d: Date): string {
    return DateTime.fromJSDate(d).toSQLDate() as string
  }

  /**
   * Lấy dữ liệu tổng quan Dashboard
   */
  async getOverview(filters: DashboardFilters) {
    let orderQuery = Order.query().whereNot('status', OrderStatus.CANCELED)

    if (filters.startDate) {
      orderQuery.where('created_at', '>=', this.parseDate(filters.startDate))
    }
    if (filters.endDate) {
      orderQuery.where('created_at', '<=', this.parseDate(filters.endDate))
    }

    const today = DateTime.now().toSQLDate() as string

    // 1. Tổng doanh thu (Chỉ tính đơn hàng đã giao thành công)
    const revenueQuery = orderQuery.clone().where('status', OrderStatus.DELIVERED)

    // Lấy mảng revenueChart theo ngày
    const chartQuery = orderQuery.clone().where('status', OrderStatus.DELIVERED)

    // Hôm nay
    const todayOrdersQuery = Order.query()
      .whereNot('status', OrderStatus.CANCELED)
      .whereRaw(`DATE(created_at) = ?`, [today])
    const todayRevenueQuery = Order.query()
      .where('status', OrderStatus.DELIVERED)
      .whereRaw(`DATE(created_at) = ?`, [today])

    // Top Products
    let topProductsQuery = db
      .from('order_items')
      .join('orders', 'order_items.order_id', '=', 'orders.id')
      .join('products', 'order_items.product_id', '=', 'products.id')
      .where('orders.status', OrderStatus.DELIVERED)
      .select('products.name')
      .select(db.raw('SUM(order_items.quantity * order_items.unit_price) as totalValue'))
      .groupBy('products.name')
      .orderBy('totalValue', 'desc')
      .limit(6)

    if (filters.startDate) {
      topProductsQuery.where('orders.created_at', '>=', this.parseDate(filters.startDate))
    }
    if (filters.endDate) {
      topProductsQuery.where('orders.created_at', '<=', this.parseDate(filters.endDate))
    }

    // Chạy song song 9 query độc lập
    const results = await Promise.all([
      revenueQuery.client.from(revenueQuery.as('q')).sum('total_amount as totalRevenue'),
      orderQuery.clone().count('* as totalOrders'),
      orderQuery.clone().select('status').count('* as count').groupBy('status'),
      db.from('user_profiles').sum('current_debt as totalDebt'),
      chartQuery.client
        .from(chartQuery.as('q'))
        .select(db.raw('DATE(created_at) as date'))
        .sum('total_amount as value')
        .count('* as ordersCount')
        .groupByRaw('DATE(created_at)')
        .orderBy('date', 'asc'),
      todayRevenueQuery.client.from(todayRevenueQuery.as('q')).sum('total_amount as revenueToday'),
      todayOrdersQuery.client.from(todayOrdersQuery.as('q')).count('* as todayOrders'),
      db.from('users').where('role', 'CUSTOMER').count('* as totalCustomers'),
      db.from('products').count('* as totalProducts'),
      topProductsQuery,
    ])

    const revenueResult = results[0][0] as AggregateRow
    const totalOrdersObj = results[1][0] as AggregateRow & { $extras?: AggregateRow }
    const orderStatuses = results[2] as OrderStatusRow[]
    const debtResult = results[3][0] as AggregateRow
    const revenueChartData = results[4] as RevenueChartRow[]
    const todayRevenueResult = results[5][0] as AggregateRow
    const todayOrdersObj = results[6][0] as AggregateRow & { $extras?: AggregateRow }
    const totalCustomersObj = results[7][0] as AggregateRow & { $extras?: AggregateRow }
    const totalProductsObj = results[8][0] as AggregateRow & { $extras?: AggregateRow }
    const topProductsData = results[9] as TopProductRow[]

    const totalRevenue = revenueResult?.totalRevenue || 0
    const totalOrders = totalOrdersObj?.$extras?.totalOrders ?? totalOrdersObj?.totalOrders ?? 0
    const totalDebt = debtResult?.totalDebt || 0
    const revenueToday = todayRevenueResult?.revenueToday || 0
    const todayOrders = todayOrdersObj?.$extras?.todayOrders ?? todayOrdersObj?.todayOrders ?? 0
    const totalCustomers =
      totalCustomersObj?.$extras?.totalCustomers ?? totalCustomersObj?.totalCustomers ?? 0
    const totalProducts =
      totalProductsObj?.$extras?.totalProducts ?? totalProductsObj?.totalProducts ?? 0

    return {
      totalRevenue: Number.parseFloat(totalRevenue.toString()),
      totalOrders: Number.parseInt(totalOrders.toString(), 10),
      totalDebt: Number.parseFloat(totalDebt.toString()),
      revenueToday: Number.parseFloat(revenueToday.toString()),
      ordersToday: Number.parseInt(todayOrders.toString(), 10),
      totalCustomers: Number.parseInt(totalCustomers.toString(), 10),
      totalProducts: Number.parseInt(totalProducts.toString(), 10),
      orderStatuses: orderStatuses.map((os) => ({
        status: os.status,
        count: Number.parseInt(os.$extras.count.toString(), 10),
      })),
      revenueChart: revenueChartData.map((item) => ({
        date: item.date,
        value: Number.parseFloat(item.value.toString()),
        ordersCount: Number.parseInt(item.ordersCount.toString(), 10),
      })),
      topProducts: topProductsData.map((item) => ({
        name: item.name,
        value: Number.parseFloat(item.totalValue.toString()),
      })),
    }
  }

  /**
   * Lấy danh sách Top Khách Hàng mua nhiều nhất
   */
  async getTopBuyers(filters: TopBuyersFilters) {
    let dateCondition = ''
    const dateBindings: string[] = []

    if (filters.startDate) {
      dateCondition += ' AND created_at >= ?'
      dateBindings.push(this.parseDate(filters.startDate))
    }
    if (filters.endDate) {
      dateCondition += ' AND created_at <= ?'
      dateBindings.push(this.parseDate(filters.endDate))
    }

    let dateConditionOrders = ''
    const dateBindingsOrders: string[] = []

    if (filters.startDate) {
      dateConditionOrders += ' AND o.created_at >= ?'
      dateBindingsOrders.push(this.parseDate(filters.startDate))
    }
    if (filters.endDate) {
      dateConditionOrders += ' AND o.created_at <= ?'
      dateBindingsOrders.push(this.parseDate(filters.endDate))
    }

    const query = db
      .from('users')
      .where('role', 'CUSTOMER')
      .whereExists((q) => {
        q.from('orders')
          .whereRaw('orders.user_id = users.id')
          .where('status', OrderStatus.DELIVERED)
        if (filters.startDate) {
          q.where('created_at', '>=', this.parseDate(filters.startDate))
        }
        if (filters.endDate) {
          q.where('created_at', '<=', this.parseDate(filters.endDate))
        }
      })
      .select(
        'users.id as userId',
        'users.full_name as fullName',
        'users.phone_number as phoneNumber',
        db.raw(
          `(SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = users.id AND status = ?${dateCondition}) as totalRevenue`,
          [OrderStatus.DELIVERED, ...dateBindings]
        ),
        db.raw(
          `(SELECT COUNT(id) FROM orders WHERE user_id = users.id AND status = ?${dateCondition}) as ordersCount`,
          [OrderStatus.DELIVERED, ...dateBindings]
        ),
        db.raw(
          `(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = users.id AND o.status = ?${dateConditionOrders}) as totalQuantity`,
          [OrderStatus.DELIVERED, ...dateBindingsOrders]
        )
      )

    if (filters.sortBy === 'revenue') {
      query.orderBy('totalRevenue', 'desc')
    } else {
      query.orderBy('totalQuantity', 'desc')
    }

    query.limit(filters.limit)

    const result = (await query) as TopBuyerRow[]

    return result.map((row) => ({
      userId: row.userId,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      totalRevenue: Number.parseFloat(row.totalRevenue?.toString() || '0'),
      ordersCount: Number.parseInt(row.ordersCount?.toString() || '0', 10),
      totalQuantity: Number.parseInt(row.totalQuantity?.toString() || '0', 10),
    }))
  }
}
