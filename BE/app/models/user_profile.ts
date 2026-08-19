import { column } from '@adonisjs/lucid/orm'
import { UserProfileSchema } from '#database/schema'
import { CustomerType } from '#enums/customer_type'

export default class UserProfile extends UserProfileSchema {
  public static primaryKey = 'userId'

  @column()
  declare customerType: CustomerType
}
