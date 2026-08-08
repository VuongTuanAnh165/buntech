import vine from '@vinejs/vine'

export const importInventoryValidator = vine.compile(
  vine.object({
    materialId: vine.number().positive(),
    quantity: vine.number().positive(), // Must be > 0
    note: vine.string().trim().maxLength(191).optional(),
    referenceId: vine.string().trim().maxLength(100).optional(),
  })
)

export const exportInventoryValidator = vine.compile(
  vine.object({
    materialId: vine.number().positive(),
    quantity: vine.number().positive(), // Must be > 0
    note: vine.string().trim().maxLength(191).optional(),
    referenceId: vine.string().trim().maxLength(100).optional(),
  })
)

export const lossReportValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().afterField('startDate').optional(),
  })
)
