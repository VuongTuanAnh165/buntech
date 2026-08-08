import { BaseSchema } from '@adonisjs/lucid/schema'
import { OrderStatus } from '#enums/order_status'
import { PaymentStatus } from '#enums/payment_status'
import { DeliveryStatus } from '#enums/delivery_status'
import { OrderSource } from '#enums/order_source'

export default class extends BaseSchema {
  protected tableName = 'orders'

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
        .integer('shipping_address_id')
        .unsigned()
        .references('id')
        .inTable('addresses')
        .onDelete('SET NULL')
        .index()
        .nullable()
      table
        .integer('driver_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()
        .nullable()
      table.date('delivery_date').notNullable()
      table.decimal('total_amount', 12, 2).notNullable()
      table.enum('status', Object.values(OrderStatus)).defaultTo(OrderStatus.PENDING)
      table.enum('payment_status', Object.values(PaymentStatus)).defaultTo(PaymentStatus.UNPAID)
      table.enum('delivery_status', Object.values(DeliveryStatus)).defaultTo(DeliveryStatus.PENDING)
      table.enum('source', Object.values(OrderSource)).notNullable()
      table.integer('route_order').nullable()
      table.text('note').nullable()

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
