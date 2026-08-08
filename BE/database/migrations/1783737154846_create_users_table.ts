import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('phone_number', 20).notNullable().unique()
      table.string('full_name', 191).notNullable()
      table.string('password', 191).notNullable()
      table.enum('role', ['admin', 'driver', 'wholesale', 'retail', 'guest']).defaultTo('retail')

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
