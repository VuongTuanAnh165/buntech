import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { Role } from '#enums/role'

export default class AdminPolicy extends BasePolicy {
  async handle(user: User) {
    return user.role === Role.ADMIN
  }
}
