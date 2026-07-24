import Order from '#models/order'
import Transaction from '#models/transaction'
import UserProfile from '#models/user_profile'
import db from '@adonisjs/lucid/services/db'
import { OrderStatus } from '#enums/order_status'
import { DeliveryStatus } from '#enums/delivery_status'
import { PaymentStatus } from '#enums/payment_status'
import { TransactionType } from '#enums/transaction_type'

export default class DriverOrderService {
  /**
   * Chốt giao hàng thành công & Thu tiền
   */
  async deliverOrder(
    orderId: number,
    driverId: number,
    data: {
      paymentMethod: string
      amountPaid: number
      deliveryNote?: string
      idempotencyKey: string
    }
  ) {
    return await db.transaction(async (trx) => {
      // 1. Kiểm tra Idempotency Key để chống Double-click từ client
      const existingTx = await Transaction.query({ client: trx })
        .where('reference_code', data.idempotencyKey)
        .first()

      if (existingTx) {
        throw new Error('Giao dịch này đã được xử lý (Idempotency conflict)')
      }

      // 2. Lock Order để tránh xung đột
      const order = await Order.query({ client: trx })
        .where('id', orderId)
        .where('driver_id', driverId)
        .forUpdate()
        .firstOrFail()

      if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELED) {
        throw new Error('Đơn hàng không ở trạng thái có thể giao')
      }

      // 3. Lock UserProfile để cập nhật công nợ
      const profile = await UserProfile.query({ client: trx })
        .where('user_id', order.userId)
        .forUpdate()
        .firstOrFail()

      let currentDebt = Number.parseFloat(profile.currentDebt || '0')
      const orderTotal = Number.parseFloat(order.totalAmount || '0')

      // Bước 3.1: Ghi NỢ đơn hàng (Tăng nợ)
      const chargeTx = new Transaction()
      chargeTx.userId = order.userId
      chargeTx.orderId = order.id
      chargeTx.amount = order.totalAmount
      chargeTx.type = TransactionType.ORDER_CHARGE
      chargeTx.paymentMethod = 'SYSTEM'
      chargeTx.referenceCode = `${data.idempotencyKey}_CHARGE`
      chargeTx.useTransaction(trx)
      await chargeTx.save()

      currentDebt += orderTotal

      // Bước 3.2: Ghi nhận THANH TOÁN (Nếu có thu tiền)
      if (data.amountPaid > 0) {
        const payTx = new Transaction()
        payTx.userId = order.userId
        payTx.orderId = order.id
        payTx.amount = data.amountPaid.toString()
        payTx.type = TransactionType.PAYMENT
        payTx.paymentMethod = data.paymentMethod
        payTx.referenceCode = data.idempotencyKey // Main idempotency key
        payTx.useTransaction(trx)
        await payTx.save()

        currentDebt -= data.amountPaid
      } else {
        // Dummy transaction to lock idempotency key if they paid 0 (DEBT)
        const dummyTx = new Transaction()
        dummyTx.userId = order.userId
        dummyTx.orderId = order.id
        dummyTx.amount = '0'
        dummyTx.type = TransactionType.DEBT_RECORD
        dummyTx.paymentMethod = data.paymentMethod
        dummyTx.referenceCode = data.idempotencyKey
        dummyTx.useTransaction(trx)
        await dummyTx.save()
      }

      // 4. Lưu lại User Profile
      profile.currentDebt = currentDebt.toString()
      profile.useTransaction(trx)
      await profile.save()

      // 5. Cập nhật Order
      order.status = OrderStatus.DELIVERED
      order.deliveryStatus = DeliveryStatus.SUCCESS
      order.paymentStatus = data.amountPaid >= orderTotal ? PaymentStatus.PAID : PaymentStatus.DEBT
      if (data.deliveryNote) {
        order.note = order.note ? `${order.note} | ${data.deliveryNote}` : data.deliveryNote
      }
      order.useTransaction(trx)
      await order.save()

      return order
    })
  }
}
