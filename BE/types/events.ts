import type Order from '#models/order'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'order:created': Order
    'order:delivered': Order
    'realtime:forward': { event: string; data: any }
  }
}
