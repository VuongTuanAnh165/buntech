import emitter from '@adonisjs/core/services/emitter'
const OrderListener = () => import('#listeners/order_listener')

/**
 * Registering listeners to events
 */
emitter.on('order:created', [OrderListener, 'onCreated'])
emitter.on('order:delivered', [OrderListener, 'onDelivered'])
