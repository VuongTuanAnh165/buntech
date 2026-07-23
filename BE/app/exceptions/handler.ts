import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { HttpStatus } from '#enums/http_status'

type ApiError = Error & {
  status?: number
  code?: string
  messages?: Record<string, string> | unknown[]
  name?: string
  errorCode?: string
}

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
    const err = error as ApiError

    // 1. Lỗi Validation từ VineJS
    if (
      err.name === 'ValidationException' ||
      err.code === 'E_VALIDATION_ERROR' ||
      err.status === HttpStatus.UNPROCESSABLE_ENTITY
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

      return ctx.response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: formattedErrors,
      })
    }

    // 2. Lỗi BusinessException (Lỗi nghiệp vụ)
    if (err.name === 'BusinessException') {
      const payload: Record<string, unknown> = {
        success: false,
        message: err.message || 'Có lỗi xảy ra',
      }
      if (err.errorCode) {
        payload.errorCode = err.errorCode
      }
      return ctx.response.status(err.status || HttpStatus.BAD_REQUEST).json(payload)
    }

    // 3. Lỗi Database: Unique Constraint Violation (PostgreSQL / MySQL)
    if (err.code === '23505' || err.code === 'ER_DUP_ENTRY') {
      return ctx.response.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'Dữ liệu này đã tồn tại trong hệ thống',
        errorCode: 'UNIQUE_CONSTRAINT_VIOLATION',
      })
    }

    // 4. Các lỗi API khác
    if (ctx.request.accepts(['json'])) {
      return ctx.response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
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
