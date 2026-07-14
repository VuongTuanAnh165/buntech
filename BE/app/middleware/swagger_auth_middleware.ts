import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class BasicAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      ctx.response.header('WWW-Authenticate', 'Basic realm="Access to API Docs"')
      return ctx.response.status(401).send('Authentication required')
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    const expectedUsername = env.get('SWAGGER_USER', 'admin')
    const expectedPassword = env.get('SWAGGER_PASSWORD', 'admin123')

    if (username === expectedUsername && password === expectedPassword) {
      return await next()
    }

    ctx.response.header('WWW-Authenticate', 'Basic realm="Access to API Docs"')
    return ctx.response.status(401).send('Invalid credentials')
  }
}
