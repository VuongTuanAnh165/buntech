import { inject } from '@adonisjs/core'
import Order from '#models/order'
import { type DateTime } from 'luxon'

@inject()
export default class ExportService {
  /**
   * Tạo Stream CSV cho danh sách đơn hàng để chống tràn RAM (OOM)
   */
  exportOrdersToCsvStream(filters: { startDate?: DateTime; endDate?: DateTime }) {
    const { Readable } = require('node:stream')
    let currentPage = 1
    const perPage = 1000
    let isFirstChunk = true
    const BOM = '\uFEFF'

    const escapeCsv = this.escapeCsv.bind(this)

    const stream = new Readable({
      async read() {
        try {
          const query = Order.query()
            .select(
              'id',
              'created_at',
              'user_id',
              'driver_id',
              'total_amount',
              'status',
              'payment_status',
              'note'
            )
            .preload('user', (q) => q.select('id', 'fullName', 'phoneNumber'))
            .preload('driver', (q) => q.select('id', 'fullName'))
            .orderBy('created_at', 'desc')

          if (filters.startDate) {
            query.where('created_at', '>=', filters.startDate.toSQLDate() as string)
          }
          if (filters.endDate) {
            query.where('created_at', '<=', filters.endDate.toSQLDate() as string)
          }

          const orders = await query.forPage(currentPage, perPage)
          const headers = [
            'Mã Đơn',
            'Ngày Tạo',
            'Khách Hàng',
            'Số ĐT Khách',
            'Tổng Tiền',
            'Trạng Thái',
            'Thanh Toán',
            'Tài Xế',
            'Ghi Chú',
          ]

          if (orders.length === 0) {
            if (isFirstChunk) {
              this.push(BOM + headers.join(',') + '\n')
            }
            this.push(null)
            return
          }

          let chunk = ''
          if (isFirstChunk) {
            chunk += BOM + headers.join(',') + '\n'
            isFirstChunk = false
          }

          for (const order of orders) {
            const row = [
              `ORD-${order.id}`,
              order.createdAt ? order.createdAt.toFormat('yyyy-MM-dd HH:mm:ss') : '',
              escapeCsv(order.user?.fullName),
              order.user?.phoneNumber || '',
              order.totalAmount,
              order.status,
              order.paymentStatus,
              escapeCsv(order.driver?.fullName),
              escapeCsv(order.note),
            ]
            chunk += row.join(',') + '\n'
          }

          this.push(chunk)
          currentPage++
        } catch (error) {
          this.destroy(error instanceof Error ? error : new Error(String(error)))
        }
      },
    })

    return stream
  }

  /**
   * Xử lý escape dấu phẩy, nháy kép trong CSV
   */
  private escapeCsv(field?: string | null): string {
    if (!field) return ''
    let stringField = String(field)
    // Nếu có dấu phẩy hoặc nháy kép hoặc xuống dòng, phải bọc trong nháy kép và escape nháy kép
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      stringField = stringField.replace(/"/g, '""')
      return `"${stringField}"`
    }
    return stringField
  }
}
