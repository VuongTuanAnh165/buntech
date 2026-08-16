import vine from '@vinejs/vine'

export const dashboardOverviewValidator = vine.compile(
  vine.object({
    startDate: vine.date({ formats: ['YYYY-MM-DD', 'iso8601'] }).optional(),
    endDate: vine
      .date({ formats: ['YYYY-MM-DD', 'iso8601'] })
      .afterField('startDate')
      .optional(),
  })
)

export const topBuyersValidator = vine.compile(
  vine.object({
    startDate: vine.date({ formats: ['YYYY-MM-DD', 'iso8601'] }).optional(),
    endDate: vine
      .date({ formats: ['YYYY-MM-DD', 'iso8601'] })
      .afterField('startDate')
      .optional(),
    limit: vine.number().min(1).max(100).optional(),
    sortBy: vine.string().in(['revenue', 'quantity']).optional(),
  })
)
