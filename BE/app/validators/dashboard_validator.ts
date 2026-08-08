import vine from '@vinejs/vine'

export const dashboardOverviewValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().afterField('startDate').optional(),
  })
)

export const topBuyersValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().afterField('startDate').optional(),
    limit: vine.number().min(1).max(100).optional(),
    sortBy: vine.string().in(['revenue', 'quantity']).optional(),
  })
)
