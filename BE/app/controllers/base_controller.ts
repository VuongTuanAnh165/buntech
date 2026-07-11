import type { HttpContext } from '@adonisjs/core/http'

export default class BaseController {
  /**
   * Helper format trả về thành công chuẩn FE
   */
  protected sendSuccess(response: HttpContext['response'], data: any = null, message: string = '') {
    const payload: any = {
      success: true,
      data,
    }

    if (message) {
      payload.message = message
    }

    return response.status(200).json(payload)
  }

  /**
   * Helper format trả về danh sách phân trang chuẩn FE
   * Truyền vào đối tượng paginator của Lucid Model
   */
  protected sendPaginated(response: HttpContext['response'], paginator: any, message: string = '') {
    const meta = paginator.getMeta()
    const payload: any = {
      success: true,
      data: paginator.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    }

    if (message) {
      payload.message = message
    }

    return response.status(200).json(payload)
  }
}
