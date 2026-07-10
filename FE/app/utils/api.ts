/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { FetchOptions, ResponseType } from 'ofetch'
import { defu } from 'defu'
import { HttpStatus } from '~/enums/http'
import type { ApiResponse } from '~/types/api'
import type { LoginResponse } from '~/types/auth'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Biến cục bộ để quản lý hàng đợi (Queue) Refresh Token
let isRefreshing = false
let refreshQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

/**
 * Lớp API Client tổng quát, cung cấp các phương thức như axios nhưng dùng $fetch.
 * Hỗ trợ tự động Refresh Token, AbortController và Custom Response Type (Blob, JSON...).
 */
export class ApiClient {
  private static async request<T, R extends ResponseType = 'json'>(
    method: HttpMethod,
    url: string,
    data?: any,
    opts?: FetchOptions<R>
  ): Promise<T> {
    const config = useRuntimeConfig()

    const defaultOptions: FetchOptions<R> = {
      baseURL: config.public.apiBaseUrl as string,
      method,
      onRequest({ options }) {
        if (import.meta.client) {
          try {
            ;(options as any).toast = useToast()
          } catch {
            // Bỏ qua nếu không lấy được context
          }
        }
        const token = useCookie('auth_token').value
        if (token) {
          options.headers = new Headers(options.headers || {})
          options.headers.set('Authorization', `Bearer ${token}`)
        }
      },
      onResponse({ response, options }) {
        if (import.meta.client) {
          const toast = (options as any).toast
          if (
            toast &&
            response.status >= HttpStatus.OK &&
            response.status < HttpStatus.MULTIPLE_CHOICES
          ) {
            const message = response._data?.message
            if (message) {
              toast.add({ title: 'Thành công', description: message, color: 'success' })
            }
          }
        }
      },
      onRequestError({ error }) {
        console.error('[API Request Error]', error)
      },
      async onResponseError(context) {
        const { request, response, options } = context
        console.error(`[API Response Error] ${response.status} at ${request}`)

        // 1. Xử lý lỗi Validate (HTTP 422) từ Backend
        if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
          // Trích xuất mảng lỗi validation từ BE: { errors: { email: ['...'] } }
          const errors = response._data?.errors
          if (errors) {
            const formattedErrors = Object.entries(errors).map(([key, messages]) => ({
              path: key,
              message: Array.isArray(messages) ? messages[0] : messages
            }))
            // Gắn mảng lỗi định dạng chuẩn Nuxt UI vào object response._data
            response._data.validationErrors = formattedErrors
          }
          // Không hiển thị Toast cho 422 vì lỗi sẽ được bôi đỏ trên từng ô Input
          return
        }

        if (import.meta.client) {
          const toast = (options as any).toast
          // Không bắn Toast lỗi ngay nếu là 401 vì ta đang có logic Refresh Token ngầm
          if (toast && response.status !== HttpStatus.UNAUTHORIZED) {
            const message = response._data?.message || 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại.'
            toast.add({ title: 'Thất bại', description: message, color: 'error' })
          }
        }

        // 1. CƠ CHẾ TỰ ĐỘNG REFRESH TOKEN KHI GẶP LỖI UNAUTHORIZED
        if (response.status === HttpStatus.UNAUTHORIZED) {
          // Nếu đang có tiến trình refresh token chạy rồi, ta đưa request này vào Queue chờ
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              refreshQueue.push({ resolve, reject })
            }).then(() => {
              // Sau khi refresh xong, gọi lại API vừa bị kẹt với token mới
              return $fetch(request as string, options as any)
            })
          }

          const originalRequest = request
          isRefreshing = true

          try {
            // Lấy refresh_token từ cookie
            const refreshTokenStr = useCookie('refresh_token').value
            if (!refreshTokenStr) throw new Error('No refresh token available')

            // Fetch trực tiếp để lấy token mới (Thay URL này bằng endpoint thật của hệ thống BE)
            const refreshRes = await $fetch<ApiResponse<LoginResponse>>('/auth/refresh', {
              baseURL: config.public.apiBaseUrl as string,
              method: 'POST',
              body: { refreshToken: refreshTokenStr }
            })

            const newToken = refreshRes.data?.accessToken
            if (newToken) {
              const authCookie = useCookie('auth_token')
              authCookie.value = newToken

              // Cập nhật lại header của request hiện tại
              options.headers = new Headers(options.headers || {})
              options.headers.set('Authorization', `Bearer ${newToken}`)

              // Xả hàng đợi: Báo cho các request đang chờ biết là đã refresh xong
              refreshQueue.forEach((q) => q.resolve())
              refreshQueue = []

              // Gọi lại API gốc
              return $fetch(originalRequest as string, options as any)
            }
          } catch (error) {
            // Nếu lấy token mới thất bại -> Clear queue, xóa cookie và logout
            refreshQueue.forEach((q) => q.reject(error))
            refreshQueue = []

            useCookie('auth_token').value = null
            useCookie('refresh_token').value = null
            navigateTo('/login')
          } finally {
            isRefreshing = false
          }
        }
      }
    }

    // Tự động phân loại body/query
    if (data) {
      if (method === 'GET' || method === 'DELETE') {
        defaultOptions.query = data
      } else {
        if (data instanceof FormData) {
          defaultOptions.body = data
        } else {
          defaultOptions.body = data
        }
      }
    }

    // Tiến hành gọi API bằng cấu trúc đã merged
    return $fetch<T>(url, defu(opts, defaultOptions) as any)
  }

  // Khai báo Generics R để hỗ trợ tải file Blob/ArrayBuffer thay vì ép cứng JSON
  static get<T = any, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, any>,
    opts?: FetchOptions<R>
  ) {
    return this.request<T, R>('GET', url, query, opts)
  }

  static post<T = any, R extends ResponseType = 'json'>(
    url: string,
    body?: any,
    opts?: FetchOptions<R>
  ) {
    return this.request<T, R>('POST', url, body, opts)
  }

  static put<T = any, R extends ResponseType = 'json'>(
    url: string,
    body?: any,
    opts?: FetchOptions<R>
  ) {
    return this.request<T, R>('PUT', url, body, opts)
  }

  static patch<T = any, R extends ResponseType = 'json'>(
    url: string,
    body?: any,
    opts?: FetchOptions<R>
  ) {
    return this.request<T, R>('PATCH', url, body, opts)
  }

  static del<T = any, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, any>,
    opts?: FetchOptions<R>
  ) {
    return this.request<T, R>('DELETE', url, query, opts)
  }

  /**
   * CƠ CHẾ UPLOAD FILE VỚI TIẾN TRÌNH (Progress Bar)
   * Sử dụng lõi XMLHttpRequest thay vì fetch để bắt được sự kiện % upload.
   */
  static upload<T = any>(
    url: string,
    fileData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const config = useRuntimeConfig()
      const token = useCookie('auth_token').value
      const xhr = new XMLHttpRequest()

      const fullUrl = url.startsWith('http') ? url : `${config.public.apiBaseUrl}${url}`

      xhr.open('POST', fullUrl, true)

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      // Lắng nghe tiến trình upload
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            onProgress(percent)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            resolve(xhr.responseText as any)
          }
        } else {
          reject({ status: xhr.status, responseText: xhr.responseText })
        }
      }

      xhr.onerror = () => reject(new Error('Network Error during upload'))

      xhr.send(fileData)
    })
  }
}
