import vine from '@vinejs/vine'

export const upsertCustomerPriceValidator = vine.compile(
  vine.object({
    productId: vine.number().positive(),
    customPrice: vine.number().positive(),
  })
)
