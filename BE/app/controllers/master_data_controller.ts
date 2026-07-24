import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import MasterDataService from '#services/master_data_service'
import { HttpStatus } from '#enums/http_status'

@inject()
export default class MasterDataController {
  constructor(protected masterDataService: MasterDataService) {}

  /**
   * @getDivisionsVersion
   * @summary Lấy phiên bản Master Data
   * @description GET /api/v1/master-data/divisions/version
   * @responseBody 200 - {"success": true, "message": "Lấy phiên bản thành công", "data": {"versionHash": "string"}}
   */
  async getDivisionsVersion({ response }: HttpContext) {
    const version = await this.masterDataService.getDivisionsVersion()
    return response.ok({
      success: true,
      message: 'Lấy phiên bản thành công',
      data: {
        versionHash: version,
      },
    })
  }

  /**
   * @getDivisions
   * @summary Lấy cây đơn vị hành chính
   * @description GET /api/v1/master-data/divisions
   * @responseBody 200 - <SuccessResponse>
   */
  async getDivisions({ request, response }: HttpContext) {
    const currentVersion = await this.masterDataService.getDivisionsVersion()

    // Check ETag
    const ifNoneMatch = request.header('if-none-match')

    if (currentVersion && ifNoneMatch === currentVersion) {
      return response.status(HttpStatus.NOT_MODIFIED).send('') // Not Modified
    }

    const divisionsTree = await this.masterDataService.getDivisionsTree()

    // Set ETag and Cache-Control

    if (currentVersion) {
      response.header('ETag', currentVersion)
    }
    response.header('Cache-Control', 'no-cache, must-revalidate')

    return response.ok({
      success: true,
      message: 'Lấy danh sách thành công',
      data: divisionsTree,
    })
  }
}
