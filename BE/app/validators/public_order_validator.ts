import vine from '@vinejs/vine'

export const quickOrderValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(100),
    phoneNumber: vine
      .string()
      .trim()
      .regex(/^0[0-9]{9}$/),
    addressLine: vine.string().trim(),
    province: vine.string().trim().maxLength(100),
    ward: vine.string().trim().maxLength(100),
    note: vine.string().trim().optional(),

    // Honeypot field (should be empty, bots often fill it)
    website_url: vine.string().optional(),

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
