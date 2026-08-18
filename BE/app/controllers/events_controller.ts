import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'
import type Order from '#models/order'

const SSE_HEARTBEAT_INTERVAL_MS = 30_000
const SSE_TIMEOUT_MS = 5 * 60 * 1000

@inject()
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

    // Heartbeat interval để giữ kết nối sống qua proxy/CDN
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n')
      } catch {
        cleanup()
      }
    }, SSE_HEARTBEAT_INTERVAL_MS)

    // Timeout: tự ngắt sau 5 phút để tránh rò rỉ connection
    const timeoutTimer = setTimeout(() => {
      try {
        res.write('event: timeout\ndata: "Connection timed out"\n\n')
      } catch {
        // Ignore write errors during cleanup
      }
      cleanup()
    }, SSE_TIMEOUT_MS)

    // Listener cho order:delivered
    const onOrderDelivered = (order: Order) => {
      try {
        res.write(`event: order:delivered\n`)
        res.write(`data: ${JSON.stringify(order)}\n\n`)
      } catch (error) {
        logger.error({ err: error }, '[SSE] Error writing order:delivered event')
        cleanup()
      }
    }

    emitter.on('order:delivered', onOrderDelivered)

    // Cleanup function: dọn dẹp toàn bộ listeners, timers và đóng response
    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true

      clearInterval(heartbeatInterval)
      clearTimeout(timeoutTimer)
      emitter.off('order:delivered', onOrderDelivered)

      try {
        res.end()
      } catch {
        // Connection may already be closed
      }
    }

    // Cleanup khi client đóng kết nối
    response.request.on('close', cleanup)
    response.request.on('error', cleanup)

    // Return pending promise — resolved khi cleanup chạy
    return new Promise<void>((resolve) => {
      const originalCleanup = cleanup
      const cleanupWithResolve = () => {
        originalCleanup()
        resolve()
      }

      // Override các event handlers để resolve promise
      response.request.removeListener('close', cleanup)
      response.request.removeListener('error', cleanup)
      response.request.on('close', cleanupWithResolve)
      response.request.on('error', cleanupWithResolve)
    })
  }
}
