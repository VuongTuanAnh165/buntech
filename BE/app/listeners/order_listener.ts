import { inject } from '@adonisjs/core'
import type Order from '#models/order'
import RealtimeService from '#services/realtime_service'

@inject()
export default class OrderListener {
  constructor(protected realtimeService: RealtimeService) {}

  /**
   * Fired when an order is created
   */
  async onCreated(order: Order) {
    await this.realtimeService.broadcast('order:created', order)
  }

  /**
   * Fired when an order is delivered
   */
  async onDelivered(order: Order) {
    await this.realtimeService.broadcast('order:delivered', order)
  }
}
