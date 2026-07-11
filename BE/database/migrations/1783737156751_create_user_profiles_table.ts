import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
        .primary()
      table.decimal('current_debt', 12, 2).defaultTo(0)
      table.decimal('debt_limit', 12, 2).defaultTo(0)
      table.string('store_name', 255).nullable()
      table.string('zalo_user_id', 255).nullable().unique()
      table.text('avatar_url').nullable()

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
