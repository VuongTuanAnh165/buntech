import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import AdministrativeDivision from '#models/administrative_division'
import MasterDataSync from '#models/master_data_sync'
import crypto from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
// import redis from '@adonisjs/redis/services/main'
const redis = {
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string) => {},
  del: async (_key: string) => {},
}
import axios from 'axios'

interface DivisionTreeItem {
  code: number
  name: string
  codename: string
  division_type: string
  phone_code?: number | null
  districts?: Omit<DivisionTreeItem, 'districts' | 'wards' | 'phone_code'>[]
  wards?: Omit<DivisionTreeItem, 'districts' | 'wards' | 'phone_code'>[]
}

interface DivisionUpsert {
  code: number
  parentCode: number | null
  name: string
  codename: string
  divisionType: string
  phoneCode: number | null
  level: string
}

@inject()
export default class MasterDataService {
  private readonly MAX_RETRIES = 3
  private readonly TIMEOUT_MS = 5000

  /**
   * Helper function to fetch API with Timeout and Retry mechanism
   */
  private async fetchWithRetry(url: string, retries = 3, timeoutMs = 5000): Promise<unknown> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, { timeout: timeoutMs })
        return response.data
      } catch (error) {
        const isTimeout = axios.isAxiosError(error) && error.code === 'ECONNABORTED'

        logger.warn(
          { attempt, url, isTimeout, error: error instanceof Error ? error.message : error },
          'Fetch open-api failed'
        )

        if (attempt === retries) {
          throw new Error(
            `Failed to fetch after ${retries} attempts: ${error instanceof Error ? error.message : String(error)}`
          )
        }

        // Exponential backoff: 1s, 2s, 3s...
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  /**
   * Đồng bộ đơn vị hành chính từ provinces.open-api.vn
   */
  public async syncDivisions() {
    logger.info('Starting sync for Administrative Divisions')

    // Fetch data from OpenAPI (depth=2: Province & District/Ward)
    let rawData: DivisionTreeItem[]
    try {
      rawData = (await this.fetchWithRetry(
        'https://provinces.open-api.vn/api/v2/?depth=2',
        this.MAX_RETRIES,
        this.TIMEOUT_MS
      )) as DivisionTreeItem[]
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch divisions from open-api completely')
      throw error
    }

    // Hash the response with a prefix to force cache invalidation when structure changes
    const payloadString = JSON.stringify(rawData)
    const currentHash = crypto
      .createHash('sha256')
      .update('v2_wards_' + payloadString)
      .digest('hex')

    // Get the latest hash from master_data_syncs
    const lastSync = await MasterDataSync.query()
      .select('source_hash')
      .where('type', 'administrative_division')
      .where('status', 'success')
      .orderBy('syncedAt', 'desc')
      .first()

    if (lastSync && lastSync.sourceHash === currentHash) {
      logger.info('No changes detected in Master Data. Skip syncing.')
      return { status: 'skipped', hash: currentHash }
    }

    // Process data
    const newCodes = new Set<number>()
    const itemsToUpsert: DivisionUpsert[] = []

    for (const province of rawData) {
      newCodes.add(province.code)
      itemsToUpsert.push({
        code: province.code,
        parentCode: null,
        name: province.name,
        codename: province.codename,
        divisionType: province.division_type,
        phoneCode: province.phone_code ?? null,
        level: 'province',
      })

      const childWards = province.wards || province.districts
      if (childWards && Array.isArray(childWards)) {
        for (const ward of childWards) {
          newCodes.add(ward.code)
          itemsToUpsert.push({
            code: ward.code,
            parentCode: province.code,
            name: ward.name,
            codename: ward.codename,
            divisionType: ward.division_type,
            phoneCode: null, // Open API may not provide phone_code for wards
            level: 'ward',
          })
        }
      }
    }

    // Begin sync transaction
    const trx = await db.transaction()
    try {
      // Chunking Upsert (1000 items per chunk)
      const chunkSize = 1000
      for (let i = 0; i < itemsToUpsert.length; i += chunkSize) {
        const chunk = itemsToUpsert.slice(i, i + chunkSize)
        await AdministrativeDivision.updateOrCreateMany('code', chunk, { client: trx })
      }

      // Identify missing codes (to handle Delete or Rename impact on Addresses)
      // Since this is a small dataset (~700 items), we can load all DB codes
      const existingRecords = await AdministrativeDivision.query({ client: trx }).select(
        'code',
        'name',
        'level'
      )

      const codesToDelete: number[] = []
      const newItemsMap = new Map(itemsToUpsert.map((item) => [item.code, item]))

      for (const record of existingRecords) {
        if (!newCodes.has(record.code)) {
          codesToDelete.push(record.code)
        } else {
          // Check for rename to update User addresses safely
          const newMatch = newItemsMap.get(record.code)
          if (newMatch && newMatch.name !== record.name) {
            // Rename case detected
            // UPDATE addresses SET ward/province = new_name WHERE ward/province = old_name
            // We do this to ensure user profiles are safely migrated.
            const columnToUpdate = record.level === 'province' ? 'province' : 'ward'
            await db
              .rawQuery(`UPDATE addresses SET ?? = ? WHERE ?? = ?`, [
                columnToUpdate,
                newMatch.name,
                columnToUpdate,
                record.name,
              ])
              .useTransaction(trx)
            logger.info(`Migrated address string from ${record.name} to ${newMatch.name}`)
          }
        }
      }

      // Delete old codes
      if (codesToDelete.length > 0) {
        await AdministrativeDivision.query({ client: trx }).whereIn('code', codesToDelete).delete()
      }

      // Create Sync Log
      await MasterDataSync.create(
        {
          type: 'administrative_division',
          sourceHash: currentHash,
          status: 'success',
          syncedAt: DateTime.now(),
        },
        { client: trx }
      )

      await trx.commit()

      // Invalidate Redis cache
      await redis.del('divisions_tree')
      await redis.del('divisions_version')

      logger.info('Master Data synchronized successfully.')
      return { status: 'success', hash: currentHash }
    } catch (error) {
      await trx.rollback()

      // Log failed sync
      await MasterDataSync.create({
        type: 'administrative_division',
        sourceHash: currentHash,
        status: 'failed',
        syncedAt: DateTime.now(),
      })

      logger.error({ err: error }, 'Transaction failed during Master Data sync')
      throw error
    }
  }

  /**
   * Get the version hash (always queries DB to detect CLI syncs)
   */
  public async getDivisionsVersion() {
    const lastSync = await MasterDataSync.query()
      .select('source_hash')
      .where('type', 'administrative_division')
      .where('status', 'success')
      .orderBy('syncedAt', 'desc')
      .first()

    const currentDbVersion = lastSync ? lastSync.sourceHash : null
    const cachedVersion = await redis.get('divisions_version')

    // If DB version differs from cached version, invalidate the tree cache
    if (cachedVersion !== currentDbVersion) {
      if (currentDbVersion) {
        await redis.set('divisions_version', currentDbVersion)
      } else {
        await redis.del('divisions_version')
      }
      await redis.del('divisions_tree') // Force rebuild on next getDivisionsTree() call
    }

    return currentDbVersion
  }

  /**
   * Lấy cấu trúc cây (Tree) của đơn vị hành chính
   * Trả về định dạng giống 100% với OpenAPI
   */
  public async getDivisionsTree() {
    const cachedStr = await redis.get('divisions_tree')
    if (cachedStr) {
      return JSON.parse(cachedStr) as DivisionTreeItem[]
    }

    // Load all divisions from DB
    const divisions = await AdministrativeDivision.query()
      .select('code', 'name', 'codename', 'division_type', 'phone_code', 'level', 'parent_code')
      .orderBy('code', 'asc')

    // Build tree on RAM (avoid N+1 query)
    const provinceMap = new Map<number, DivisionTreeItem>()
    const tree: DivisionTreeItem[] = []

    // 1. Gắn các province
    for (const div of divisions) {
      if (div.level === 'province') {
        const item = {
          code: div.code,
          name: div.name,
          codename: div.codename,
          division_type: div.divisionType,
          phone_code: div.phoneCode,
          wards: [], // Update to use wards based on new requirement
        }
        provinceMap.set(div.code, item)
        tree.push(item)
      }
    }

    // 2. Gắn các wards vào đúng province
    for (const div of divisions) {
      if (div.level === 'ward' && div.parentCode) {
        const parent = provinceMap.get(div.parentCode)
        if (parent) {
          if (!parent.wards) {
            parent.wards = []
          }
          parent.wards.push({
            code: div.code,
            name: div.name,
            codename: div.codename,
            division_type: div.divisionType,
          })
        }
      }
    }

    // Set cache
    await redis.set('divisions_tree', JSON.stringify(tree))
    return tree
  }
}
