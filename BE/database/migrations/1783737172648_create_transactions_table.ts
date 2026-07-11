import { BaseSchema } from '@adonisjs/lucid/schema'
import { TransactionType } from '#enums/transaction_type'
import { PaymentMethod } from '#enums/payment_method'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
      table
        .integer('order_id')
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('SET NULL')
        .index()
        .nullable()
      table.decimal('amount', 12, 2).notNullable()
      table.enum('type', Object.values(TransactionType)).notNullable()
      table.enum('payment_method', Object.values(PaymentMethod)).notNullable()
      table.string('reference_code', 100).nullable()
      table.timestamp('transaction_date').notNullable()

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
