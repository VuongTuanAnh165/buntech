import { ApiClient } from '~/utils/api'
import type { DriverNotification } from '~/composables/driver/useDriverNotifications'

export const driverNotificationService = {
  getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return ApiClient.get<{
      success: boolean
      data: {
        data: DriverNotification[]
        meta: { total: number; perPage: number; currentPage: number; lastPage: number }
      }
    }>('/driver/notifications', { page, limit, unreadOnly })
  },
  markAsRead(id: string) {
    return ApiClient.patch(`/driver/notifications/${id}/read`)
  },
  markAllAsRead() {
    return ApiClient.patch(`/driver/notifications/mark-all-read`)
  }
}
