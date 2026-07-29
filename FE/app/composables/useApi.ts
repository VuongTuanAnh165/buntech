import type { UseFetchOptions } from 'nuxt/app'
import { defu } from 'defu'
import { hash } from 'ohash'
import { fetchWithAuth } from '~/utils/api'

export interface CustomUseFetchOptions<T> extends UseFetchOptions<T> {
  silent?: boolean
  ignoreErrorCodes?: string[]
}

/**
 * Hàm gọi API tổng quát trên SSR. Khắc phục lỗi Cache Collision và tự động chuyển tiếp Cookie.
 */
export function useApi<T>(url: string, opts: CustomUseFetchOptions<T> = {}) {
  const token = useCookie('auth_token').value

  // 1. FIX LỖI CACHE COLLISION TRÊN SSR
  // Băm chuỗi URL kết hợp với query, method VÀ TOKEN để tạo ra Key cache riêng biệt cho mỗi Request (User-specific)
  const uniqueKey = hash([url, opts.query, opts.body, opts.method, token])

  const defaultOptions: CustomUseFetchOptions<T> = {
    key: uniqueKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $fetch: fetchWithAuth as any
  }

  return useFetch<T>(url, defu(opts, defaultOptions) as Parameters<typeof useFetch<T>>[1])
}

/**
 * Các Helper function giúp gọi nhanh SSR tương ứng với các HTTP Methods
 */

export const useApiGet = <T = unknown>(
  url: string,
  query?: Record<string, unknown>,
  opts?: CustomUseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'GET', query, ...opts })
}

export const useApiPost = <T = unknown>(
  url: string,
  body?: Record<string, unknown> | FormData | string | null,
  opts?: CustomUseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'POST', body, ...opts })
}

export const useApiPut = <T = unknown>(
  url: string,
  body?: Record<string, unknown> | FormData | string | null,
  opts?: CustomUseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'PUT', body, ...opts })
}

export const useApiDelete = <T = unknown>(
  url: string,
  query?: Record<string, unknown>,
  opts?: CustomUseFetchOptions<T>
) => {
  return useApi<T>(url, { method: 'DELETE', query, ...opts })
}
