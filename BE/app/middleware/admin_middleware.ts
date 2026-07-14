import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import AdminPolicy from '#policies/admin_policy'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.bouncer.with(AdminPolicy).denies('handle')) {
      return ctx.response.forbidden({
        success: false,
        message: 'Bạn không có quyền thực hiện chức năng này',
      })
    }
    return next()
  }
}
