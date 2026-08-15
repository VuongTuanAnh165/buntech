import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import NotificationService from '#services/notification_service'
import { formatPagination } from '#utils/pagination'
import {
  driverNotificationIndexValidator,
  driverNotificationMarkAsReadValidator,
} from '#validators/driver_notification_validator'

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
    const payload = await request.validateUsing(driverNotificationIndexValidator)
    const page = payload.page || 1
    const limit = payload.limit || 20
    const unreadOnly = payload.unreadOnly || false
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
  async markAsRead({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(driverNotificationMarkAsReadValidator)
    const userId = auth.user!.id
    const notification = await this.notificationService.markAsRead(payload.params.id, userId)

    return response.ok({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: notification,
    })
  }

  /**
   * @markAllAsRead
   * @summary Đánh dấu tất cả đã đọc
   * @description Đánh dấu tất cả thông báo của tài xế là đã đọc
   * @responseBody 200 - <SuccessResponse>
   */
  async markAllAsRead({ response, auth }: HttpContext) {
    const userId = auth.user!.id
    await this.notificationService.markAllAsRead(userId)

    return response.ok({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc',
      data: null,
    })
  }
}
