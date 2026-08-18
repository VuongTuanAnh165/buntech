import UserProfile from '#models/user_profile'
import Order from '#models/order'
import { DateTime } from 'luxon'
import { OrderStatus } from '#enums/order_status'

export default class CustomerDashboardService {
  /**
   * Lấy dữ liệu tổng quan Dashboard khách sỉ
   */
  async getOverview(userId: number) {
    const profile = await UserProfile.query()
      .select('current_debt', 'debt_limit', 'updated_at')
      .where('user_id', userId)
      .first()

    const currentDebt = profile?.currentDebt ? Number(profile.currentDebt) : 0
    const debtLimit = profile?.debtLimit ? Number(profile.debtLimit) : 0

    // Tổng chi tiêu: Tổng tiền của tất cả các đơn hàng KHÔNG bị hủy
    const totalSpentResult = await Order.query()
      .where('user_id', userId)
      .whereNotIn('status', [OrderStatus.CANCELLED, OrderStatus.CANCELED])
      .sum('total_amount as total')
      .first()
    const totalSpent = totalSpentResult?.$extras.total ? Number(totalSpentResult.$extras.total) : 0

    // Số đơn hàng trong 30 ngày qua
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate()
    const totalOrders30DaysResult = await Order.query()
      .where('user_id', userId)
      .where('created_at', '>=', thirtyDaysAgo)
      .count('* as total')
      .first()
    const totalOrders30Days = totalOrders30DaysResult?.$extras.total
      ? Number(totalOrders30DaysResult.$extras.total)
      : 0

    return {
      currentDebt,
      debtLimit,
      totalSpent,
      totalOrders30Days,
      currency: 'VND',
      updatedAt: profile?.updatedAt?.toISO() || DateTime.now().toISO(),
    }
  }
}
