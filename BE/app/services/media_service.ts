import { inject } from '@adonisjs/core'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class MediaService {
  /**
   * Quét chuỗi HTML để tìm các ảnh Tmp, chuyển chúng sang thư mục Images chính thức,
   * đồng thời xoá các ảnh cũ (nếu có) bị gỡ khỏi văn bản.
   * Tuân thủ Rule 8: Dọn rác ổ cứng khi cập nhật bản ghi.
   *
   * @param oldHtml Chuỗi HTML cũ (nếu là cập nhật)
   * @param newHtml Chuỗi HTML mới
   * @returns Chuỗi HTML đã được cập nhật URL ảnh
   */
  async processHtmlImages(
    oldHtml: string | null | undefined,
    newHtml: string | null | undefined
  ): Promise<string> {
    if (!newHtml) return ''

    let updatedHtml = newHtml
    // Regex lấy src của thẻ img (hỗ trợ cả nháy đơn, nháy kép)
    const regex = /<img[^>]+src=["']([^"']+)["']/gi

    const newImageUrls = Array.from(newHtml.matchAll(regex)).map((match) => match[1])
    const oldImageUrls = oldHtml ? Array.from(oldHtml.matchAll(regex)).map((match) => match[1]) : []

    // 1. Chuyển ảnh mới từ tmp/ sang images/
    for (const url of newImageUrls) {
      if (url.includes('/uploads/tmp/')) {
        try {
          const filename = url.substring(url.lastIndexOf('/') + 1)
          const tmpKey = `tmp/${filename}`
          const newKey = `images/${filename}`

          if (await drive.use('fs').exists(tmpKey)) {
            // Adonis Drive có copy và delete (Move tương đương copy + delete)
            await drive.use('fs').copy(tmpKey, newKey)
            await drive.use('fs').delete(tmpKey)
            logger.info(`[MediaService] Moved image from ${tmpKey} to ${newKey}`)

            // Replace URL trong HTML string
            const newUrl = url.replace('/uploads/tmp/', '/uploads/images/')
            updatedHtml = updatedHtml.replace(url, newUrl)
          }
        } catch (error) {
          logger.error(`[MediaService] Error moving image ${url}: ${(error as Error).message}`)
        }
      }
    }

    // 2. Dọn rác: Xoá các ảnh bị gỡ bỏ khỏi bài viết
    for (const url of oldImageUrls) {
      if (!newImageUrls.includes(url) && url.includes('/uploads/images/')) {
        try {
          const filename = url.substring(url.lastIndexOf('/') + 1)
          const key = `images/${filename}`

          if (await drive.use('fs').exists(key)) {
            await drive.use('fs').delete(key)
            logger.info(`[MediaService] Deleted orphaned image ${key}`)
          }
        } catch (error) {
          logger.error(
            `[MediaService] Error deleting orphaned image ${url}: ${(error as Error).message}`
          )
        }
      }
    }

    return updatedHtml
  }
}
