import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const token = ctx.request.input('token')
    if (token && ctx.request.url().includes('/sse')) {
      ctx.request.request.headers.authorization = `Bearer ${token}`
    }

    await ctx.auth.authenticateUsing(options.guards)
    return next()
  }
}
