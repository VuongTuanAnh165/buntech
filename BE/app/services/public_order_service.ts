import db from '@adonisjs/lucid/services/db'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import User from '#models/user'
import UserProfile from '#models/user_profile'
import Address from '#models/address'
import { DateTime } from 'luxon'

export default class PublicOrderService {
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
    // 1. Verify Products and calculate total amount BEFORE transaction
    const productIds = data.items.map((i) => i.productId)
    const products = await Product.query().whereIn('id', productIds)

    let totalAmount = 0
    const orderItemsData: Array<{ productId: number; quantity: number; unitPrice: number }> = []

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product || !product.isActive) {
        throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại hoặc đã ngừng bán`)
      }

      const unitPrice = Number.parseFloat(product.basePrice)
      totalAmount += unitPrice * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
      })
    }

    return await db.transaction(async (trx) => {
      // 2. Find or Create Guest User
      let user = await User.query({ client: trx }).where('phone_number', data.phoneNumber).first()

      if (!user) {
        user = new User()
        user.phoneNumber = data.phoneNumber
        user.fullName = data.fullName
        user.role = 'GUEST'
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
      order.source = 'WEB_QUICK_ORDER'
      order.status = 'PENDING'
      order.deliveryStatus = 'PENDING'
      order.paymentStatus = 'UNPAID'
      order.totalAmount = totalAmount.toString()
      order.note = data.note || null
      // Default delivery date to tomorrow
      order.deliveryDate = DateTime.now().plus({ days: 1 })

      order.useTransaction(trx)
      await order.save()

      // 5. Create Order Items
      for (const itemData of orderItemsData) {
        const orderItem = new OrderItem()
        orderItem.orderId = order.id
        orderItem.productId = itemData.productId
        orderItem.quantity = itemData.quantity
        orderItem.unitPrice = itemData.unitPrice
        orderItem.useTransaction(trx)
        await orderItem.save()
      }

      await order.load('items')
      return order
    })
  }
}
