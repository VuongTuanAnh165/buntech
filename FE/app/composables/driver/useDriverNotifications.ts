import { driverNotificationService } from '~/services/driverNotificationService'
export interface DriverNotification {
  id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  type?: string
  data?: unknown
}

export function useDriverNotifications() {
  const notifications = ref<DriverNotification[]>([])
  const meta = ref({ total: 0, perPage: 20, currentPage: 1, lastPage: 1 })
  const pending = ref(false)
  const error = ref<unknown>(null)

  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    pending.value = true
    try {
      const res = await driverNotificationService.getNotifications(page, 20, unreadOnly)
      if (page === 1) {
        notifications.value = res.data.data
      } else {
        notifications.value = [...notifications.value, ...res.data.data]
      }
      meta.value = res.data.meta
    } catch (err) {
      error.value = err
    } finally {
      pending.value = false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await driverNotificationService.markAsRead(id)
      const notif = notifications.value.find((n) => n.id === id)
      if (notif) {
        notif.isRead = true
      }
    } catch {
      // ignore
    }
  }

  const markAllAsRead = async () => {
    try {
      await driverNotificationService.markAllAsRead()
      notifications.value.forEach((n) => {
        n.isRead = true
      })
    } catch {
      // ignore
    }
  }

  return {
    notifications,
    meta,
    pending,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
