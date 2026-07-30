import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import type Order from '#models/order'

export default class EventsController {
  /**
   * @sse
   * @summary Kết nối Server-Sent Events (SSE)
   * @description Dùng để lắng nghe các sự kiện realtime (vd: order:delivered) từ server
   */
  async stream({ response }: HttpContext) {
    const res = response.response

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    // Gửi event ping giữ kết nối
    res.write(': connected\n\n')

    // Listener cho order:delivered
    const onOrderDelivered = (order: Order) => {
      res.write(`event: order:delivered\n`)
      res.write(`data: ${JSON.stringify(order)}\n\n`)
    }

    emitter.on('order:delivered', onOrderDelivered)

    // Cleanup khi client đóng kết nối
    response.request.on('close', () => {
      emitter.off('order:delivered', onOrderDelivered)
    })

    // Return pending promise to keep request alive
    return new Promise(() => {})
  }
}
