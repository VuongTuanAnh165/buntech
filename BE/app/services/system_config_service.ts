import SystemConfig from '#models/system_config'
import { Pagination } from '#enums/pagination'

export default class SystemConfigService {
  private cache = new Map<string, any>()

  /**
   * Get paginated list of system configs
   */
  async getConfigs(page: number = 1, limit: number = Pagination.DEFAULT_LIMIT) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT || 100)
    return SystemConfig.query()
      .select('key', 'value', 'description', 'created_at')
      .orderBy('created_at', 'desc')
      .paginate(page, safeLimit)
  }

  /**
   * Get a single config by key (Cached)
   */
  async getConfig(key: string) {
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    const config = await SystemConfig.query()
      .select('key', 'value', 'description')
      .where('key', key)
      .firstOrFail()
    this.cache.set(key, config)
    return config
  }

  /**
   * Create a new config
   */
  async createConfig(data: { key: string; value: string; description?: string }) {
    const config = await SystemConfig.create(data)
    this.cache.set(data.key, config)
    return config
  }

  /**
   * Update an existing config
   */
  async updateConfig(key: string, data: { value: string; description?: string }) {
    const config = await SystemConfig.query()
      .select('key', 'value', 'description')
      .where('key', key)
      .firstOrFail()
    config.merge(data)
    await config.save()
    this.cache.set(key, config)
    return config
  }

  /**
   * Delete a config
   */
  async deleteConfig(key: string) {
    const config = await SystemConfig.query().select('key').where('key', key).firstOrFail()
    await config.delete()
    this.cache.delete(key)
  }
}
