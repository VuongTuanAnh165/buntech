import { ApiClient } from '~/utils/api'
import type { SystemConfig, Paginated } from '~/utils/types'

export function useSystemConfigs() {
  const fetchConfigs = async (params: Record<string, string | number | undefined>) => {
    return await ApiClient.get<Paginated<SystemConfig>>('/admin/system-configs', params)
  }

  const getConfig = async (key: string) => {
    return await ApiClient.get<{ data: SystemConfig }>(`/admin/system-configs/${key}`)
  }

  const createConfig = async (payload: { key: string; value: string; description?: string }) => {
    return await ApiClient.post<{ data: SystemConfig }>('/admin/system-configs', payload)
  }

  const updateConfig = async (key: string, payload: { value: string; description?: string }) => {
    return await ApiClient.put<{ data: SystemConfig }>(`/admin/system-configs/${key}`, payload)
  }

  const deleteConfig = async (key: string) => {
    return await ApiClient.del<{ message: string }>(`/admin/system-configs/${key}`)
  }

  return {
    fetchConfigs,
    getConfig,
    createConfig,
    updateConfig,
    deleteConfig
  }
}
