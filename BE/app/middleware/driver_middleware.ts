import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import DriverPolicy from '#policies/driver_policy'

export default class DriverMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.bouncer.with(DriverPolicy).denies('handle')) {
      return ctx.response.forbidden({
        success: false,
        message: 'Bạn không có quyền thực hiện chức năng này',
      })
    }
    return next()
  }
}
