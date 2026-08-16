import { ApiClient } from '~/utils/api'

export const rawMaterialService = {
  getRawMaterials(page: number = 1, limit: number = 20, search?: string) {
    return ApiClient.get('/admin/raw-materials', { page, limit, search })
  },

  getRawMaterial(id: number) {
    return ApiClient.get(`/admin/raw-materials/${id}`)
  },

  createRawMaterial(data: { name: string; unit: string }) {
    return ApiClient.post('/admin/raw-materials', data)
  },

  updateRawMaterial(id: number, data: { name?: string; unit?: string }) {
    return ApiClient.put(`/admin/raw-materials/${id}`, data)
  },

  deleteRawMaterial(id: number) {
    return ApiClient.del(`/admin/raw-materials/${id}`)
  },

  getSummary() {
    return ApiClient.get('/admin/raw-materials/summary')
  }
}
