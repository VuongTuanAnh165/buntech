import vine from '@vinejs/vine'

export const driverNotificationIndexValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    unreadOnly: vine.boolean().optional(),
  })
)

export const driverNotificationMarkAsReadValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive(),
    }),
  })
)
