import Notification from '#models/notification'
import { Pagination } from '#enums/pagination'
import { inject } from '@adonisjs/core'

@inject()
export default class NotificationService {
  /**
   * Lấy danh sách thông báo của user
   */
  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = Pagination.DEFAULT_LIMIT,
    unreadOnly: boolean = false
  ) {
    const query = Notification.query()
      .where('user_id', userId)
      .select('id', 'type', 'title', 'body', 'is_read', 'created_at')
      .orderBy('created_at', 'desc')

    if (unreadOnly) {
      query.where('is_read', false)
    }

    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT || 100)
    return query.paginate(page, safeLimit)
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await Notification.query()
      .where('id', notificationId)
      .where('user_id', userId)
      .firstOrFail()

    notification.isRead = true
    await notification.save()

    return notification
  }
}
