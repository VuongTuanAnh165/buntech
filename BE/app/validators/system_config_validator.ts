import vine from '@vinejs/vine'

export const createSystemConfigValidator = vine.compile(
  vine.object({
    key: vine
      .string()
      .trim()
      .maxLength(100)
      .unique(async (db, value) => {
        const existing = await db.from('system_configs').where('key', value).first()
        return !existing
      }),
    value: vine.string().trim(),
    description: vine.string().trim().maxLength(255).optional(),
  })
)

export const updateSystemConfigValidator = vine.compile(
  vine.object({
    value: vine.string().trim(),
    description: vine.string().trim().maxLength(255).optional(),
  })
)
