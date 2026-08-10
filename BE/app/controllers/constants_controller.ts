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

import { HttpStatus } from '#enums/http_status'
import crypto from 'node:crypto'

@inject()
export default class ConstantsController {
  async index({ request, response }: HttpContext) {
    const data = {
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
    }

    const jsonString = JSON.stringify(data)
    const etag = crypto.createHash('md5').update(jsonString).digest('hex')

    const ifNoneMatch = request.header('if-none-match')
    if (ifNoneMatch === etag) {
      return response.status(HttpStatus.NOT_MODIFIED).send('')
    }

    response.header('ETag', etag)
    response.header('Cache-Control', 'no-cache, must-revalidate')

    return response.json({
      success: true,
      message: 'Lấy cấu hình hằng số thành công',
      data,
    })
  }
}
