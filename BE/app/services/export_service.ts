import Order from '#models/order'
import { type DateTime } from 'luxon'

export default class ExportService {
  /**
   * Tạo nội dung CSV cho danh sách đơn hàng
   */
  async exportOrdersToCsv(filters: { startDate?: DateTime; endDate?: DateTime }): Promise<string> {
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

    // Lấy toàn bộ dữ liệu (cần chú ý nếu dữ liệu quá lớn nên dùng Cursor/Stream, nhưng ở đây demo xuất ngày/tháng nên lấy all)
    // Để Enterprise-ready, ta nên dùng query stream. AdonisJS Lucid hỗ trợ .client.stream()
    // Tuy nhiên để trả về 1 chuỗi hoàn chỉnh cho controller tải xuống, ta build string:
    const orders = await query

    // Header CSV
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

    let csvContent = headers.join(',') + '\n'

    // Body CSV
    for (const order of orders) {
      const row = [
        `ORD-${order.id}`,
        order.createdAt ? order.createdAt.toFormat('yyyy-MM-dd HH:mm:ss') : '',
        this.escapeCsv(order.user?.fullName),
        order.user?.phoneNumber || '',
        order.totalAmount,
        order.status,
        order.paymentStatus,
        this.escapeCsv(order.driver?.fullName),
        this.escapeCsv(order.note),
      ]
      csvContent += row.join(',') + '\n'
    }

    return csvContent
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
