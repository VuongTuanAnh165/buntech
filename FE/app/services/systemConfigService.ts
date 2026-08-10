import { ApiClient } from '~/utils/api'
import type { SystemConfig, Paginated } from '~/utils/types'

export const systemConfigService = {
  fetchConfigs(params: Record<string, string | number | undefined>) {
    return ApiClient.get<Paginated<SystemConfig>>('/admin/system-configs', params)
  },
  getConfig(key: string) {
    return ApiClient.get<{ data: SystemConfig }>(`/admin/system-configs/${key}`)
  },
  createConfig(payload: { key: string; value: string; description?: string }) {
    return ApiClient.post<{ data: SystemConfig }>('/admin/system-configs', payload)
  },
  updateConfig(key: string, payload: { value: string; description?: string }) {
    return ApiClient.put<{ data: SystemConfig }>(`/admin/system-configs/${key}`, payload)
  },
  deleteConfig(key: string) {
    return ApiClient.del<{ message: string }>(`/admin/system-configs/${key}`)
  }
}
