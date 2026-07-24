import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'
import { type DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status'

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
    const [revenueResult] = await revenueQuery.client
      .from(revenueQuery.as('q'))
      .sum('total_amount as totalRevenue')
    const totalRevenue = revenueResult?.totalRevenue || 0

    // 2. Tổng số lượng đơn hàng (Các đơn chưa bị hủy)
    const [
      {
        $extras: { totalOrders },
      },
    ] = await orderQuery.clone().count('* as totalOrders')

    // 3. Thống kê theo trạng thái đơn hàng
    const orderStatuses = await orderQuery
      .clone()
      .select('status')
      .count('* as count')
      .groupBy('status')

    // 4. Tổng công nợ toàn hệ thống
    const [debtResult] = await db.from('user_profiles').sum('current_debt as totalDebt')
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
