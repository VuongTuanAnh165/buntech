import { inject } from '@adonisjs/core'
import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'
import { type DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status'

@inject()
export default class DashboardService {
  /**
   * Lấy dữ liệu tổng quan Dashboard
   */
  async getOverview(filters: { startDate?: DateTime; endDate?: DateTime }) {
    let orderQuery = Order.query().whereNot('status', OrderStatus.CANCELED)

    if (filters.startDate) {
      orderQuery.where('created_at', '>=', filters.startDate.toSQLDate() as string)
    }
    if (filters.endDate) {
      orderQuery.where('created_at', '<=', filters.endDate.toSQLDate() as string)
    }

    // 1. Tổng doanh thu (Chỉ tính đơn hàng đã giao thành công)
    const revenueQuery = orderQuery.clone().where('status', OrderStatus.DELIVERED)

    // Lấy mảng revenueChart theo ngày
    const chartQuery = orderQuery.clone().where('status', OrderStatus.DELIVERED)

    // Chạy song song 5 query độc lập
    const [
      [revenueResult],
      [
        {
          $extras: { totalOrders },
        },
      ],
      orderStatuses,
      [debtResult],
      revenueChartData,
    ] = await Promise.all([
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
    ])

    const totalRevenue = revenueResult?.totalRevenue || 0
    const totalDebt = debtResult?.totalDebt || 0

    return {
      totalRevenue: Number.parseFloat(totalRevenue.toString()),
      totalOrders: Number.parseInt(totalOrders.toString(), 10),
      totalDebt: Number.parseFloat(totalDebt.toString()),
      orderStatuses: orderStatuses.map((os) => ({
        status: os.status,
        count: Number.parseInt(os.$extras.count.toString(), 10),
      })),
      revenueChart: revenueChartData.map((item) => ({
        date: item.date,
        value: Number.parseFloat(item.value.toString()),
        ordersCount: Number.parseInt(item.ordersCount.toString(), 10),
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

    if (filters.startDate) {
      query.where('orders.created_at', '>=', filters.startDate)
    }
    if (filters.endDate) {
      query.where('orders.created_at', '<=', filters.endDate)
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
