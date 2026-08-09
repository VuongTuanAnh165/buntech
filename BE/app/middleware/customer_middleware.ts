import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import CustomerPolicy from '#policies/customer_policy'

export default class CustomerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (await ctx.bouncer.with(CustomerPolicy).denies('handle')) {
      return ctx.response.forbidden({
        success: false,
        message: 'Bạn không có quyền thực hiện chức năng này',
      })
    }
    return next()
  }
}
