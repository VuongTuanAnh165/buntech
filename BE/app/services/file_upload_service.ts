import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import logger from '@adonisjs/core/services/logger'

export default class FileUploadService {
  /**
   * Upload a single file to a specific folder
   * Returns the uploaded URL and the Key (useful for rollback)
   */
  async upload(file: MultipartFile, folder: string): Promise<{ url: string; key: string }> {
    const key = `${folder}/${randomUUID()}.${file.extname}`
    await file.moveToDisk(key)
    const url = await drive.use().getUrl(key)
    return { url, key }
  }

  /**
   * Upload multiple files concurrently
   * Returns array of {url, key}
   */
  async uploadMany(
    files: MultipartFile[],
    folder: string
  ): Promise<Array<{ url: string; key: string }>> {
    const validFiles = files.filter((f) => !!f)
    const uploadPromises = validFiles.map((file) => this.upload(file, folder))
    return await Promise.all(uploadPromises)
  }

  /**
   * Delete a single file by key
   */
  async delete(key: string): Promise<void> {
    try {
      await drive.use().delete(key)
    } catch (error) {
      logger.warn(`Failed to delete file from disk: ${key}`)
    }
  }

  /**
   * Delete multiple files concurrently
   */
  async deleteMany(keys: string[]): Promise<void> {
    const validKeys = keys.filter((k) => !!k)
    const deletePromises = validKeys.map((key) => this.delete(key))
    await Promise.all(deletePromises)
  }

  /**
   * Extract key from URL
   * This is necessary because DB stores URL but drive requires key to delete.
   * Assume the folder is the prefix we care about, e.g. "categories" or "products"
   */
  extractKeyFromUrl(url: string | null | undefined, folder: string): string | null {
    if (url && url.includes(`${folder}/`)) {
      return url.substring(url.indexOf(`${folder}/`))
    }
    return null
  }
}
