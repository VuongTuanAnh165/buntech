import { column } from '@adonisjs/lucid/orm'
import { UserProfileSchema } from '#database/schema'
import { CustomerType } from '#enums/customer_type'

export default class UserProfile extends UserProfileSchema {
  @column()
  declare customerType: CustomerType
}
