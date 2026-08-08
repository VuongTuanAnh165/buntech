import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DeliveryStatus } from '#enums/delivery_status'
import { DeviceType } from '#enums/device_type'
import { InventoryType } from '#enums/inventory_type'
import { OrderSource } from '#enums/order_source'
import { OrderStatus } from '#enums/order_status'
import { PaymentMethod } from '#enums/payment_method'
import { PaymentStatus } from '#enums/payment_status'
import { Role } from '#enums/role'
import { TransactionType } from '#enums/transaction_type'
import { CustomerType } from '#enums/customer_type'

@inject()
export default class ConstantsController {
  async index({ response }: HttpContext) {
    return response.json({
      success: true,
      message: 'Lấy cấu hình hằng số thành công',
      data: {
        DeliveryStatus,
        DeviceType,
        InventoryType,
        OrderSource,
        OrderStatus,
        PaymentMethod,
        PaymentStatus,
        Role,
        TransactionType,
        CustomerType,
      },
    })
  }
}
