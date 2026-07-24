import vine from '@vinejs/vine'

export const dashboardOverviewValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
  })
)
