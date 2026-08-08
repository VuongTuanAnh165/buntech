import vine from '@vinejs/vine'

export const quickOrderValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(100),
    phoneNumber: vine
      .string()
      .trim()
      .regex(/^[0-9]{10,11}$/),
    address: vine.string().trim(),
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
