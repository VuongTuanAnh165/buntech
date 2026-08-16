import { ApiClient } from '~/utils/api'

export const inventoryService = {
  importMaterial(data: {
    materialId: number
    quantity: number
    note?: string
    referenceId?: string
  }) {
    return ApiClient.post('/admin/inventory/import', data)
  },
  exportMaterial(data: {
    materialId: number
    quantity: number
    note?: string
    referenceId?: string
  }) {
    return ApiClient.post('/admin/inventory/export', data)
  },
  getLossReport(startDate?: string, endDate?: string) {
    return ApiClient.get('/admin/inventory/loss-report', {
      params: { startDate, endDate }
    })
  },
  getHistory(limit: number = 10) {
    return ApiClient.get('/admin/inventory/history', {
      params: { limit }
    })
  }
}
