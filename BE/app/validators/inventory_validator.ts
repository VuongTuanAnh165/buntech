import vine from '@vinejs/vine'

export const importInventoryValidator = vine.compile(
  vine.object({
    materialId: vine.number().positive(),
    quantity: vine.number().positive(), // Must be > 0
    note: vine.string().trim().maxLength(255).optional(),
    referenceId: vine.string().trim().maxLength(100).optional(),
  })
)
