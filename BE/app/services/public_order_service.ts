import db from '@adonisjs/lucid/services/db'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import User from '#models/user'
import UserProfile from '#models/user_profile'
import Address from '#models/address'
import { DateTime } from 'luxon'
import { Role } from '#enums/role'
import { OrderSource } from '#enums/order_source'
import { OrderStatus } from '#enums/order_status'
import { DeliveryStatus } from '#enums/delivery_status'
import { PaymentStatus } from '#enums/payment_status'
import { inject } from '@adonisjs/core'
import OrderCalculatorService from '#services/order_calculator_service'

@inject()
export default class PublicOrderService {
  constructor(protected orderCalculator: OrderCalculatorService) {}
  /**
   * Create a quick order (guest)
   */
  async createQuickOrder(data: {
    fullName: string
    phoneNumber: string
    address: string
    note?: string
    items: Array<{ productId: number; quantity: number }>
  }) {
    // 1. Calculate total amount BEFORE transaction
    const { totalAmount, orderItemsData } = await this.orderCalculator.calculateOrder(data.items)

    return await db.transaction(async (trx) => {
      // 2. Find or Create Guest User
      let user = await User.query({ client: trx })
        .select('id', 'phone_number', 'full_name', 'role')
        .where('phone_number', data.phoneNumber)
        .first()

      if (!user) {
        user = new User()
        user.phoneNumber = data.phoneNumber
        user.fullName = data.fullName
        user.role = Role.GUEST
        user.useTransaction(trx)
        await user.save()

        const profile = new UserProfile()
        profile.userId = user.id
        profile.useTransaction(trx)
        await profile.save()
      } else {
        if (!user.fullName) {
          user.fullName = data.fullName
          user.useTransaction(trx)
          await user.save()
        }
      }

      // 3. Find or Create Address for this user
      let address = await Address.query({ client: trx })
        .select('id', 'user_id', 'address_line')
        .where('user_id', user.id)
        .where('address_line', data.address)
        .first()

      if (!address) {
        address = new Address()
        address.userId = user.id
        address.addressLine = data.address
        address.useTransaction(trx)
        await address.save()
      }

      // 4. Create Order
      const order = new Order()
      order.userId = user.id
      order.shippingAddressId = address.id
      order.source = OrderSource.WEB_QUICK_ORDER
      order.status = OrderStatus.PENDING
      order.deliveryStatus = DeliveryStatus.PENDING
      order.paymentStatus = PaymentStatus.UNPAID
      order.totalAmount = totalAmount.toString()
      order.note = data.note || null
      // Default delivery date to tomorrow
      order.deliveryDate = DateTime.now().plus({ days: 1 })

      order.useTransaction(trx)
      await order.save()

      // 5. Create Order Items
      const itemsToCreate = orderItemsData.map((itemData) => ({
        orderId: order.id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
      }))
      await OrderItem.createMany(itemsToCreate, { client: trx })

      await order.load('items')
      return order
    })
  }
}
