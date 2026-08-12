import { inject } from '@adonisjs/core'
import SystemConfig from '#models/system_config'
import { Pagination } from '#enums/pagination'

@inject()
export default class SystemConfigService {
  private static cache = new Map<string, SystemConfig>()

  /**
   * Get paginated list of system configs
   */
  async getConfigs(page: number = 1, limit: number = Pagination.DEFAULT_LIMIT, search?: string) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT || 100)
    const query = SystemConfig.query()
      .select('key', 'value', 'description', 'created_at')
      .orderBy('created_at', 'desc')

    if (search) {
      query.where((q) => {
        q.whereILike('key', `%${search}%`)
          .orWhereILike('value', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
      })
    }

    return query.paginate(page, safeLimit)
  }

  /**
   * Get a single config by key (Cached)
   */
  async getConfig(key: string) {
    if (SystemConfigService.cache.has(key)) {
      return SystemConfigService.cache.get(key)
    }
    const config = await SystemConfig.query()
      .select('key', 'value', 'description')
      .where('key', key)
      .firstOrFail()
    SystemConfigService.cache.set(key, config)
    return config
  }

  /**
   * Create a new config
   */
  async createConfig(data: { key: string; value: string; description?: string }) {
    const config = await SystemConfig.create(data)
    SystemConfigService.cache.set(data.key, config)
    return config
  }

  /**
   * Update an existing config
   */
  async updateConfig(key: string, data: { value: string; description?: string }) {
    const config = await SystemConfig.query().where('key', key).firstOrFail()
    config.merge(data)
    await config.save()
    SystemConfigService.cache.set(key, config)
    return config
  }

  /**
   * Delete a config
   */
  async deleteConfig(key: string) {
    const config = await SystemConfig.query().where('key', key).firstOrFail()
    await config.delete()
    SystemConfigService.cache.delete(key)
  }
}
