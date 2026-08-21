import redis from '@adonisjs/redis/services/main'
import logger from '@adonisjs/core/services/logger'
import emitter from '@adonisjs/core/services/emitter'

const REALTIME_CHANNEL = 'buntech_realtime'

export default class RealtimeService {
  private isSubscribed = false

  /**
   * Broadcast an event to all Redis subscribers (all instances)
   */
  async broadcast(event: string, payload: any) {
    try {
      const message = JSON.stringify({ event, data: payload })
      await redis.publish(REALTIME_CHANNEL, message)
    } catch (error) {
      logger.error({ err: error, event }, '[RealtimeService] Failed to broadcast event to Redis')
    }
  }

  /**
   * Ensure this instance is subscribed to Redis exactly once.
   * Incoming messages from Redis are multiplexed to the local Event Emitter.
   */
  async ensureSubscription() {
    if (this.isSubscribed) return

    try {
      await redis.subscribe(REALTIME_CHANNEL, (message) => {
        try {
          const parsed = JSON.parse(message)
          // Phát lại sự kiện cục bộ (Local Emitter) để EventsController hứng
          emitter.emit('realtime:forward', parsed)
        } catch (err) {
          logger.error({ err }, '[RealtimeService] Failed to parse Redis message')
        }
      })
      this.isSubscribed = true
      logger.info('[RealtimeService] Subscribed to Redis realtime channel')
    } catch (error) {
      logger.error({ err: error }, '[RealtimeService] Failed to subscribe to Redis')
    }
  }
}
