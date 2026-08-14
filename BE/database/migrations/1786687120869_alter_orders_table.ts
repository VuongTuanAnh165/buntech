import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('delivery_fee', 15, 2).defaultTo(0)
      table.decimal('amount_collected', 15, 2).defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('delivery_fee', 'amount_collected')
    })
  }
}
