import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import app from '@adonisjs/core/services/app'
import { readdir, stat, rm } from 'node:fs/promises'
import { join } from 'node:path'

export default class CleanupTmp extends BaseCommand {
  static commandName = 'cleanup:tmp'
  static description =
    'Dọn dẹp các file rác (orphan files) trong thư mục uploads/tmp đã cũ hơn 24 giờ'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Bắt đầu dọn dẹp thư mục tmp...')
    const tmpPath = app.makePath('storage/tmp')

    try {
      const files = await readdir(tmpPath)
      const now = Date.now()
      const ONE_DAY_MS = 24 * 60 * 60 * 1000
      let deletedCount = 0

      for (const file of files) {
        const filePath = join(tmpPath, file)
        const fileStat = await stat(filePath)

        if (fileStat.isFile() && now - fileStat.mtimeMs > ONE_DAY_MS) {
          await rm(filePath)
          deletedCount++
          this.logger.success(`Đã xoá: ${file}`)
        }
      }

      this.logger.success(`Hoàn tất! Đã xoá ${deletedCount} file rác.`)
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.logger.info('Thư mục tmp trống hoặc không tồn tại, không có gì để dọn dẹp.')
      } else {
        this.logger.error(`Lỗi khi dọn dẹp: ${(error as Error).message}`)
      }
    }
  }
}
