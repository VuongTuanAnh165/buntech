/**
 * Responsibility: Quản lý các lệnh gọi API liên quan đến Upload File (Hình ảnh, tài liệu...)
 * Dependency: utils/api (ApiClient)
 * Lifecycle: Singleton service (Stateless)
 * Reason: Trừu tượng hóa API upload, tách biệt khỏi tầng UI components theo chuẩn kiến trúc.
 */
import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export const uploadService = {
  /**
   * Upload một file ảnh đơn lẻ lên server
   * @param file File ảnh cần upload
   * @returns URL của ảnh sau khi upload thành công
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    // Upload endpoint trả về { data: { url: string, path: string } }
    const res = await ApiClient.post<ApiResponse<{ url: string; path: string }>>(
      '/admin/upload',
      formData
    )

    if (res.data?.url) {
      const config = useRuntimeConfig()
      const apiBaseUrl = config.public.apiBaseUrl as string
      let finalUrl = res.data.url
      if (finalUrl.startsWith('/')) {
        // Extract origin from apiBaseUrl (e.g. "http://localhost:3333/api/v1" -> "http://localhost:3333")
        try {
          const origin = new URL(apiBaseUrl).origin
          finalUrl = `${origin}${finalUrl}`
        } catch {
          // fallback if apiBaseUrl is not a valid absolute URL
        }
      }
      return finalUrl
    }
    throw new Error('Không nhận được URL ảnh từ server')
  }
}
