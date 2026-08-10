import { systemConfigService } from '~/services/systemConfigService'

export function useSystemConfigs() {
  const fetchConfigs = async (params: Record<string, string | number | undefined>) => {
    return await systemConfigService.fetchConfigs(params)
  }

  const getConfig = async (key: string) => {
    return await systemConfigService.getConfig(key)
  }

  const createConfig = async (payload: { key: string; value: string; description?: string }) => {
    return await systemConfigService.createConfig(payload)
  }

  const updateConfig = async (key: string, payload: { value: string; description?: string }) => {
    return await systemConfigService.updateConfig(key, payload)
  }

  const deleteConfig = async (key: string) => {
    return await systemConfigService.deleteConfig(key)
  }

  return {
    fetchConfigs,
    getConfig,
    createConfig,
    updateConfig,
    deleteConfig
  }
}
