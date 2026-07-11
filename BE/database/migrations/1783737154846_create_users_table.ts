import { BaseSchema } from '@adonisjs/lucid/schema'
import { Role } from '#enums/role'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('phone_number', 20).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('full_name', 255).notNullable()
      table.enum('role', Object.values(Role)).defaultTo(Role.RETAIL)

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
      table.integer('created_by').unsigned().nullable()
      table.integer('updated_by').unsigned().nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
