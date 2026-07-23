import vine from '@vinejs/vine'

export const createAdminOrderValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    shippingAddressId: vine.number().positive(),
    note: vine.string().trim().optional(),
    deliveryDate: vine.date().optional(),
    items: vine
      .array(
        vine.object({
          productId: vine.number().positive(),
          quantity: vine.number().positive().min(1),
        })
      )
      .minLength(1),
  })
)

export const updateOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.string().trim(), // e.g., PENDING, PROCESSING, DELIVERING, DELIVERED, CANCELED
    deliveryStatus: vine.string().trim().optional(),
    paymentStatus: vine.string().trim().optional(),
  })
)

export const batchAssignDriverValidator = vine.compile(
  vine.object({
    driverId: vine.number().positive(),
    orders: vine
      .array(
        vine.object({
          orderId: vine.number().positive(),
          routeOrder: vine.number().min(0),
        })
      )
      .minLength(1),
  })
)
