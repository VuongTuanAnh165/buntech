import vine from '@vinejs/vine'

export const createCustomerOrderValidator = vine.compile(
  vine.object({
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
