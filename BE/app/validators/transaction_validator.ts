import vine from '@vinejs/vine'

export const transactionIndexValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    userId: vine.number().positive().optional(),
    type: vine.string().trim().optional(),
    search: vine.string().trim().optional(),
  })
)

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
