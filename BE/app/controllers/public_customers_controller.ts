import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import UserService from '#services/user_service'
import { DateTime } from 'luxon'

/** Tier thresholds (đơn vị: đồng) */
enum TierThreshold {
  DIAMOND = 50_000_000,
  GOLD = 20_000_000,
  SILVER = 5_000_000,
}

/** Số ngày tối đa để đánh dấu "Vừa nhập lô mới" */
const RESTOCK_DAYS = 7

type CustomerTier = 'diamond' | 'gold' | 'silver' | 'bronze'

@inject()
export default class PublicCustomersController {
  constructor(protected userService: UserService) {}

  /**
   * @index
   * @summary Danh sách đại lý công khai
   * @description Lấy danh sách khách hàng có is_public = true, kèm gamification tier và FOMO badge.
   * API Public, không yêu cầu Auth.
   * @responseBody 200 - { success: true, message: string, data: PublicCustomer[] }
   */
  async index({ response }: HttpContext) {
    const users = await this.userService.getPublicCustomers()

    const now = DateTime.now()

    const data = users.map((user) => {
      const monthlyVolume = Number(user.$extras.monthly_volume) || 0
      const lastOrderDate = user.$extras.last_order_date
        ? DateTime.fromJSDate(new Date(user.$extras.last_order_date))
        : null

      let tier: CustomerTier = 'bronze'
      if (monthlyVolume > TierThreshold.DIAMOND) {
        tier = 'diamond'
      } else if (monthlyVolume > TierThreshold.GOLD) {
        tier = 'gold'
      } else if (monthlyVolume > TierThreshold.SILVER) {
        tier = 'silver'
      }

      const isRecentlyRestocked =
        lastOrderDate !== null &&
        lastOrderDate.isValid &&
        now.diff(lastOrderDate, 'days').days <= RESTOCK_DAYS

      return {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        storeName: user.profile?.storeName ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        tier,
        monthlyVolume,
        isRecentlyRestocked,
        addresses: (user.addresses ?? []).map((addr) => ({
          id: addr.id,
          province: addr.province,
          ward: addr.ward,
          addressLine: addr.addressLine,
          latitude: addr.latitude ? Number(addr.latitude) : null,
          longitude: addr.longitude ? Number(addr.longitude) : null,
        })),
      }
    })

    return response.ok({
      success: true,
      message: 'Lấy danh sách đại lý thành công',
      data,
    })
  }
}
