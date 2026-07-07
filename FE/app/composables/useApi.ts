/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFetchOptions } from 'nuxt/app'
import { defu } from 'defu'
import { hash } from 'ohash'
import { HttpStatus } from '~/enums/http'

/**
 * Hàm gọi API tổng quát trên SSR. Khắc phục lỗi Cache Collision và tự động chuyển tiếp Cookie.
 */
export function useApi<T>(url: string, opts: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()

  // 1. FIX LỖI CACHE COLLISION TRÊN SSR
  // Băm chuỗi URL kết hợp với query và method để tạo ra Key cache riêng biệt cho mỗi Request
  const uniqueKey = hash([url, opts.query, opts.body, opts.method])

  const defaultOptions: UseFetchOptions<T> = {
    baseURL: config.public.apiBaseUrl as string,
    key: uniqueKey,
    onRequest({ options }) {
      if (import.meta.client) {
        try {
          (options as any).toast = useToast()
        } catch {
          // Bỏ qua nếu mất context
        }
      }

      if (import.meta.server) {
        // 2. CHUYỂN TIẾP COOKIE KHI CHẠY SSR
        // Đảm bảo Server của Nuxt mang theo Cookie của User khi gửi request sang Server Backend
        const headers = useRequestHeaders(['cookie'])
        options.headers = new Headers(options.headers || {})
        if (headers.cookie) {
          options.headers.set('cookie', headers.cookie)
        }
      } else {
        // Môi trường Client
        const token = useCookie('auth_token').value
        if (token) {
          options.headers = new Headers(options.headers || {})
          options.headers.set('Authorization', `Bearer ${token}`)
        }
      }
    },
    onResponse({ response, options }) {
      if (import.meta.client) {
        const toast = (options as any).toast
        if (toast && response.status >= HttpStatus.OK && response.status < HttpStatus.MULTIPLE_CHOICES) {
          const message = (response._data as any)?.message
          if (message) {
            toast.add({ title: 'Thành công', description: message, color: 'success' })
          }
        }
      }
    },
    onRequestError({ error }) {
      console.error('[useApi Request Error]', error)
    },
    onResponseError({ request, response, options }) {
      console.error(`[useApi Response Error] ${response.status} at ${request}`)
      if (import.meta.client) {
        const toast = (options as any).toast
        if (toast && response.status !== HttpStatus.UNAUTHORIZED) { // 401 sẽ do api.ts xử lý refresh token
          const message = (response._data as any)?.message || 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại.'
          toast.add({ title: 'Thất bại', description: message, color: 'error' })
        }
      }
    }
  }

  return useFetch<T>(url, defu(opts, defaultOptions) as any)
}

/**
 * Các Helper function giúp gọi nhanh SSR tương ứng với các HTTP Methods
 */

export const useApiGet = <T = any>(
  url: string,
  query?: Record<string, any>,
  opts?: UseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'GET', query, ...opts } as any)
}

export const useApiPost = <T = any>(url: string, body?: any, opts?: UseFetchOptions<T>) => {
  return useApi<T>(url, { method: 'POST', body, ...opts } as any)
}

export const useApiPut = <T = any>(url: string, body?: any, opts?: UseFetchOptions<T>) => {
  return useApi<T>(url, { method: 'PUT', body, ...opts } as any)
}

export const useApiDelete = <T = any>(
  url: string,
  query?: Record<string, any>,
  opts?: UseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'DELETE', query, ...opts } as any)
}
