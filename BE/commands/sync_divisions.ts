import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { inject } from '@adonisjs/core'
import MasterDataService from '#services/master_data_service'

export default class SyncDivisions extends BaseCommand {
  static commandName = 'sync:divisions'
  static description = 'Sync administrative divisions from OpenAPI'

  static options: CommandOptions = {
    startApp: true,
  }

  @inject()
  async run(masterDataService: MasterDataService) {
    this.logger.info('Starting master data sync process...')

    try {
      const result = await masterDataService.syncDivisions()
      if (result.status === 'skipped') {
        this.logger.success('Sync skipped. Data is already up to date.')
      } else {
        this.logger.success(`Sync successful. New hash: ${result.hash}`)
      }
    } catch (error: any) {
      this.logger.error(`Sync failed: ${error.message}`)
      this.exitCode = 1
    }
  }
}
