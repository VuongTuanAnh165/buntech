import type { HttpContext } from '@adonisjs/core/http'
import { HttpStatus } from '#enums/http_status'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
export default class BaseController {
  /**
   * Helper format trả về thành công chuẩn FE
   */
  protected sendSuccess(
    response: HttpContext['response'],
    data: unknown = null,
    message: string = ''
  ) {
    const payload: Record<string, unknown> = {
      success: true,
      data,
    }

    if (message) {
      payload.message = message
    }

    return response.status(HttpStatus.OK).json(payload)
  }

  /**
   * Helper format trả về danh sách phân trang chuẩn FE
   * Truyền vào đối tượng paginator của Lucid Model
   */
  protected sendPaginated(
    response: HttpContext['response'],
    paginator: ModelPaginatorContract<any>,
    message: string = ''
  ) {
    const meta = paginator.getMeta()
    const payload: Record<string, unknown> = {
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

    return response.status(HttpStatus.OK).json(payload)
  }
}
