import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import crypto from 'node:crypto'
import { uploadValidator } from '#validators/upload_validator'

export default class UploadsController {
  /**
   * @store
   * @summary Upload ảnh
   * @description Tải lên một file ảnh (tối đa 5MB, định dạng jpg, png, jpeg, webp)
   * @requestFormDataBody {"image": "file"}
   * @requestBody <uploadValidator>
   * @responseBody 200 - <UploadResponse>
   */
  async store({ request, response }: HttpContext) {
    const { image } = await request.validateUsing(uploadValidator)

    // Rename file to prevent path traversal and ensure uniqueness
    const key = `images/${crypto.randomUUID()}.${image.extname}`

    // Use drive to store the file
    await image.moveToDisk(key, 'fs')

    // Get URL of the uploaded file
    const url = await drive.use('fs').getUrl(key)

    return response.ok({
      success: true,
      message: 'Upload ảnh thành công',
      data: {
        url: url,
        path: key,
      },
    })
  }
}
