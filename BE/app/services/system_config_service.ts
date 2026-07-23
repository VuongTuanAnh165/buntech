import SystemConfig from '#models/system_config'

export default class SystemConfigService {
  /**
   * Get paginated list of system configs
   */
  async getConfigs(page: number = 1, limit: number = 100) {
    return SystemConfig.query().orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get a single config by key
   */
  async getConfig(key: string) {
    return SystemConfig.findOrFail(key)
  }

  /**
   * Create a new config
   */
  async createConfig(data: { key: string; value: string; description?: string }) {
    return SystemConfig.create(data)
  }

  /**
   * Update an existing config
   */
  async updateConfig(key: string, data: { value: string; description?: string }) {
    const config = await SystemConfig.findOrFail(key)
    config.merge(data)
    await config.save()
    return config
  }

  /**
   * Delete a config
   */
  async deleteConfig(key: string) {
    const config = await SystemConfig.findOrFail(key)
    await config.delete()
  }
}
