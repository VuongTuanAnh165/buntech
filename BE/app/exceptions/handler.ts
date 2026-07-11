import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const err = error as any

    // 1. Lỗi Validation từ VineJS
    if (
      err.name === 'ValidationException' ||
      err.code === 'E_VALIDATION_ERROR' ||
      err.status === 422
    ) {
      const formattedErrors: Record<string, string[]> = {}

      if (Array.isArray(err.messages)) {
        err.messages.forEach((msg: any) => {
          if (!formattedErrors[msg.field]) {
            formattedErrors[msg.field] = []
          }
          formattedErrors[msg.field].push(msg.message)
        })
      } else if (err.messages && typeof err.messages === 'object') {
        // Fallback in case messages is already an object
        Object.assign(formattedErrors, err.messages)
      }

      return ctx.response.status(422).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: formattedErrors,
      })
    }

    // 2. Lỗi BusinessException (Lỗi nghiệp vụ)
    if (err.name === 'BusinessException') {
      const payload: any = {
        success: false,
        message: err.message || 'Có lỗi xảy ra',
      }
      if (err.errorCode) {
        payload.errorCode = err.errorCode
      }
      return ctx.response.status(err.status || 400).json(payload)
    }

    // 3. Các lỗi API khác
    if (ctx.request.accepts(['json'])) {
      return ctx.response.status(err.status || 500).json({
        success: false,
        message: err.message || 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại.',
        errorCode: err.code || 'INTERNAL_ERROR',
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
