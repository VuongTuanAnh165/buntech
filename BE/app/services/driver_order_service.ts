import { inject } from '@adonisjs/core'
import Order from '#models/order'
import Transaction from '#models/transaction'
import db from '@adonisjs/lucid/services/db'
import { OrderStatus } from '#enums/order_status'
import { DeliveryStatus } from '#enums/delivery_status'
import { PaymentStatus } from '#enums/payment_status'
import { TransactionType } from '#enums/transaction_type'
import { DateTime } from 'luxon'

@inject()
export default class DriverOrderService {
  /**
   * Chốt giao hàng thành công & Thu tiền
   */
  async deliverOrder(
    orderId: number,
    driverId: number,
    data: {
      paymentMethod?: string
      amountCollected: number
      deliveryNote?: string
      idempotencyKey: string
    }
  ) {
    return await db.transaction(async (trx) => {
      // 1. Lock Order ĐẦU TIÊN để tránh xung đột (Race Condition)
      const order = await Order.query({ client: trx })
        .select('id', 'user_id', 'driver_id', 'status', 'total_amount', 'note')
        .where('id', orderId)
        .where('driver_id', driverId)
        .forUpdate()
        .firstOrFail()

      if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELED) {
        throw new Error('Đơn hàng không ở trạng thái có thể giao')
      }

      // 2. Kiểm tra Idempotency Key để chống Double-click từ client (Sau khi đã lock order)
      const existingTx = await Transaction.query({ client: trx })
        .select('id')
        .where('reference_code', data.idempotencyKey)
        .first()

      if (existingTx) {
        throw new Error('Giao dịch này đã được xử lý (Idempotency conflict)')
      }

      // 3. (Removed explicit lock since DB native update handles atomic row locking)

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

      // Bước 3.2: Ghi nhận THANH TOÁN (Nếu có thu tiền)
      if (data.amountCollected > 0) {
        const payTx = new Transaction()
        payTx.userId = order.userId
        payTx.orderId = order.id
        payTx.amount = data.amountCollected.toString()
        payTx.type = TransactionType.PAYMENT
        payTx.paymentMethod = data.paymentMethod || 'CASH'
        payTx.referenceCode = data.idempotencyKey // Main idempotency key
        payTx.useTransaction(trx)
        await payTx.save()
      } else {
        // Dummy transaction to lock idempotency key if they paid 0 (DEBT)
        const dummyTx = new Transaction()
        dummyTx.userId = order.userId
        dummyTx.orderId = order.id
        dummyTx.amount = '0'
        dummyTx.type = TransactionType.DEBT_RECORD
        dummyTx.paymentMethod = data.paymentMethod || 'CASH'
        dummyTx.referenceCode = data.idempotencyKey
        dummyTx.useTransaction(trx)
        await dummyTx.save()
      }

      // 4. Lưu lại User Profile bằng DB Native Math (DB trừ trực tiếp)
      await db
        .from('user_profiles')
        .where('user_id', order.userId)
        .update({
          current_debt: db.raw('current_debt + ? - ?', [order.totalAmount, data.amountCollected]),
          updated_at: DateTime.now().toSQL(),
        })
        .useTransaction(trx)

      // 5. Cập nhật Order
      const orderTotalFloat = Number.parseFloat(order.totalAmount || '0')
      order.status = OrderStatus.DELIVERED
      order.deliveryStatus = DeliveryStatus.SUCCESS
      order.paymentStatus =
        data.amountCollected >= orderTotalFloat ? PaymentStatus.PAID : PaymentStatus.DEBT
      if (data.deliveryNote) {
        order.note = order.note ? `${order.note} | ${data.deliveryNote}` : data.deliveryNote
      }
      order.useTransaction(trx)
      await order.save()

      return order
    })
  }
}
