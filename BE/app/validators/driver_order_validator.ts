import vine from '@vinejs/vine'

export const deliverOrderValidator = vine.compile(
  vine.object({
    paymentMethod: vine.string().trim().maxLength(50), // e.g., CASH, BANK_TRANSFER, DEBT
    amountPaid: vine.number().min(0),
    deliveryNote: vine.string().trim().optional(),
    // Idempotency key to prevent double-charging if driver clicks 'Submit' twice
    idempotencyKey: vine.string().trim().maxLength(100),
  })
)
