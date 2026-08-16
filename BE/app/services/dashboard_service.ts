import { inject } from '@adonisjs/core'
import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status'

@inject()
export default class DashboardService {
  /**
   * Lấy dữ liệu tổng quan Dashboard
   */
  async getOverview(filters: { startDate?: any; endDate?: any }) {
    let orderQuery = Order.query().whereNot('status', OrderStatus.CANCELED)

    const parseDate = (d: any) =>
      d && typeof d.toSQLDate === 'function'
        ? d.toSQLDate()
        : DateTime.fromJSDate(new Date(d)).toSQLDate()

    if (filters.startDate) {
      orderQuery.where('created_at', '>=', parseDate(filters.startDate) as string)
    }
    if (filters.endDate) {
      orderQuery.where('created_at', '<=', parseDate(filters.endDate) as string)
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
      topProductsQuery.where('orders.created_at', '>=', parseDate(filters.startDate) as string)
    }
    if (filters.endDate) {
      topProductsQuery.where('orders.created_at', '<=', parseDate(filters.endDate) as string)
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

    const revenueResult = results[0][0] as any
    const totalOrdersObj = results[1][0] as any
    const orderStatuses = results[2] as any[]
    const debtResult = results[3][0] as any
    const revenueChartData = results[4] as any[]
    const todayRevenueResult = results[5][0] as any
    const todayOrdersObj = results[6][0] as any
    const totalCustomersObj = results[7][0] as any
    const totalProductsObj = results[8][0] as any
    const topProductsData = results[9] as any[]

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
  async getTopBuyers(filters: {
    startDate?: any
    endDate?: any
    limit: number
    sortBy: 'revenue' | 'quantity'
  }) {
    let query = Order.query()
      .where('status', OrderStatus.DELIVERED)
      .join('users', 'orders.user_id', '=', 'users.id')
      .select(
        'users.id as userId',
        'users.full_name as fullName',
        'users.phone_number as phoneNumber'
      )
      .sum('orders.total_amount as totalRevenue')
      .count('orders.id as ordersCount')
      // Note: for totalQuantityKg, we would need to join order_items and sum quantity * product weight
      // But keeping it simple based on the current schema context
      .groupBy('users.id')

    const parseDate = (d: any) =>
      d && typeof d.toSQLDate === 'function'
        ? d.toSQLDate()
        : DateTime.fromJSDate(new Date(d)).toSQLDate()

    if (filters.startDate) {
      query.where('orders.created_at', '>=', parseDate(filters.startDate) as string)
    }
    if (filters.endDate) {
      query.where('orders.created_at', '<=', parseDate(filters.endDate) as string)
    }

    if (filters.sortBy === 'revenue') {
      query.orderBy('totalRevenue', 'desc')
    } else {
      // If we don't have quantity easily sum-able without deep joins, we fallback to ordersCount or mock it
      // query.orderBy('totalQuantityKg', 'desc')
      query.orderBy('ordersCount', 'desc')
    }

    query.limit(filters.limit)

    const result = await query

    return result.map((row) => ({
      userId: row.$extras.userId,
      fullName: row.$extras.fullName,
      phoneNumber: row.$extras.phoneNumber,
      totalRevenue: Number.parseFloat(row.$extras.totalRevenue?.toString() || '0'),
      ordersCount: Number.parseInt(row.$extras.ordersCount?.toString() || '0', 10),
    }))
  }
}
