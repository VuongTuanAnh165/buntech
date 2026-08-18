import UserProfile from '#models/user_profile'
import { DateTime } from 'luxon'

export default class CustomerDebtService {
  /**
   * Lấy thông tin công nợ của khách sỉ
   */
  async getDebtInfo(userId: number) {
    const profile = await UserProfile.query()
      .select('current_debt', 'debt_limit', 'updated_at')
      .where('user_id', userId)
      .first()

    const currentDebt = profile?.currentDebt ? Number(profile.currentDebt) : 0
    const debtLimit = profile?.debtLimit ? Number(profile.debtLimit) : 0

    return {
      currentDebt,
      debtLimit,
      currency: 'VND',
      updatedAt: profile?.updatedAt?.toISO() || DateTime.now().toISO(),
    }
  }
}
