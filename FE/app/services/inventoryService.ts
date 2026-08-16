import { ApiClient } from '~/utils/api'

export const inventoryService = {
  getHistory(limit: number = 10) {
    return ApiClient.get('/admin/inventory/history', {
      params: { limit }
    })
  }
}
