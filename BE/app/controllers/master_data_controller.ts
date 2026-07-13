import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import MasterDataService from '#services/master_data_service'

@inject()
export default class MasterDataController {
  constructor(protected masterDataService: MasterDataService) {}

  /**
   * GET /api/v1/master-data/divisions/version
   */
  async getDivisionsVersion({ response }: HttpContext) {
    const version = await this.masterDataService.getDivisionsVersion()
    return response.ok({
      success: true,
      data: {
        versionHash: version,
      },
    })
  }

  /**
   * GET /api/v1/master-data/divisions
   */
  async getDivisions({ request, response }: HttpContext) {
    const currentVersion = await this.masterDataService.getDivisionsVersion()

    // Check ETag
    const ifNoneMatch = request.header('if-none-match')
    if (currentVersion && ifNoneMatch === currentVersion) {
      return response.status(304).send('') // Not Modified
    }

    const divisionsTree = await this.masterDataService.getDivisionsTree()

    // Set ETag and Cache-Control
    if (currentVersion) {
      response.header('ETag', currentVersion)
    }
    response.header('Cache-Control', 'no-cache, must-revalidate')

    return response.ok({
      success: true,
      data: divisionsTree,
    })
  }
}
