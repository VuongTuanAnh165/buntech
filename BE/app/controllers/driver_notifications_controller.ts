import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import NotificationService from '#services/notification_service'
import { formatPagination } from '#utils/pagination'

@inject()
export default class DriverNotificationsController {
  constructor(protected notificationService: NotificationService) {}

  /**
   * @index
   * @summary Danh sách thông báo
   * @description Lấy danh sách các thông báo của tài xế đang đăng nhập
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery unreadOnly - Lọc những thông báo chưa đọc (true/false)
   * @responseBody 200 - <PaginatedNotificationListResponse>
   */
  async index({ request, response, auth }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const unreadOnly = request.input('unreadOnly') === 'true'
    const userId = auth.user!.id

    const notifications = await this.notificationService.getUserNotifications(
      userId,
      page,
      limit,
      unreadOnly
    )

    return response.ok({
      success: true,
      message: 'Lấy danh sách thông báo thành công',
      data: formatPagination(notifications),
    })
  }

  /**
   * @markAsRead
   * @summary Đánh dấu đã đọc
   * @description Đánh dấu một thông báo cụ thể là đã đọc
   * @paramPath id - ID thông báo
   * @responseBody 200 - <NotificationResponse>
   */
  async markAsRead({ params, response, auth }: HttpContext) {
    const userId = auth.user!.id
    const notification = await this.notificationService.markAsRead(params.id, userId)

    return response.ok({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: notification,
    })
  }
}
