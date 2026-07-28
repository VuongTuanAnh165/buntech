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

    // Chạy song song 4 query độc lập
    const [
      [revenueResult],
      [
        {
          $extras: { totalOrders },
        },
      ],
      orderStatuses,
      [debtResult],
    ] = await Promise.all([
      revenueQuery.client.from(revenueQuery.as('q')).sum('total_amount as totalRevenue'),
      orderQuery.clone().count('* as totalOrders'),
      orderQuery.clone().select('status').count('* as count').groupBy('status'),
      db.from('user_profiles').sum('current_debt as totalDebt'),
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
    }
  }
}
