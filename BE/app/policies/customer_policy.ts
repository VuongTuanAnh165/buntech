import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { Role } from '#enums/role'

export default class CustomerPolicy extends BasePolicy {
  async handle(user: User) {
    return user.role === Role.CUSTOMER
  }

  async viewOrder(user: User, order: { userId: number }) {
    return user.id === order.userId
  }
}
