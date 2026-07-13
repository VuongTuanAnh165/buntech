import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'administrative_divisions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('code').primary()
      table.integer('parent_code').nullable().index()
      table.string('name', 255).notNullable()
      table.string('codename', 255).notNullable()
      table.string('division_type', 100).notNullable()
      table.integer('phone_code').nullable()
      table.string('level', 50).notNullable().index()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
