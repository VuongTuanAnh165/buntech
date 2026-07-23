import vine from '@vinejs/vine'

export const payDebtValidator = vine.compile(
  vine.object({
    userId: vine.number().positive(),
    amount: vine.number().positive(),
    paymentMethod: vine.string().trim().maxLength(50), // e.g. CASH, BANK_TRANSFER
    referenceCode: vine.string().trim().maxLength(100).optional(),
    note: vine.string().trim().optional(),
    transactionDate: vine.date().optional(),
  })
)
