import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_public').defaultTo(false).notNullable()
      table.index(['is_public'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['is_public'])
      table.dropColumn('is_public')
    })
  }
}
