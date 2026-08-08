// No any allowed
import type { FetchOptions, ResponseType } from 'ofetch'
import { defu } from 'defu'
import { HttpStatus } from '~/enums/http'
import type { ApiResponse } from '~/types/api'
import type { LoginResponse } from '~/types/auth'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface CustomFetchOptions<R extends ResponseType = 'json'> extends FetchOptions<R> {
  silent?: boolean
  ignoreErrorCodes?: string[]
  abortId?: string
}

// --- REFRESH STATE ---
type RefreshResolve = (value: string | PromiseLike<string>) => void
type RefreshReject = (reason?: unknown) => void
type RefreshQueueItem = { resolve: RefreshResolve; reject: RefreshReject }

interface RefreshState {
  isRefreshing: boolean
  queue: RefreshQueueItem[]
}

const ssrStateMap = new WeakMap<object, RefreshState>()
const clientState: RefreshState = { isRefreshing: false, queue: [] }

const getRefreshState = (): RefreshState => {
  if (import.meta.client) return clientState
  const nuxtApp = tryUseNuxtApp()
  if (nuxtApp) {
    let state = ssrStateMap.get(nuxtApp)
    if (!state) {
      state = { isRefreshing: false, queue: [] }
      ssrStateMap.set(nuxtApp, state)
    }
    return state
  }
  return { isRefreshing: false, queue: [] }
}

const abortControllers = new Map<string, AbortController>()

const generateIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function hasResponseMessage(data: unknown): data is { message: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as Record<string, unknown>).message === 'string'
  )
}

/**
 * Hàm chuẩn hóa Pagination Response từ Backend.
 * Do Backend đôi khi trả meta ở root level (cùng với data) hoặc lồng bên trong data.data,
 * và tên field thỉnh thoảng dùng snake_case (per_page) hoặc camelCase (perPage).
 */
export function normalizePaginationResponse<T>(res: any): { data: T[]; meta: import('~/types/api').PaginationMeta } {
  let items: T[] = []
  const meta: import('~/types/api').PaginationMeta = {
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
    firstPage: 1
  }

  if (!res) return { data: items, meta }

  // Trường hợp 1: BE trả meta ngang hàng data (Ví dụ: categories_controller)
  if (Array.isArray(res.data) && res.meta) {
    items = res.data
    meta.currentPage = res.meta.page ?? res.meta.currentPage ?? 1
    meta.perPage = res.meta.pageSize ?? res.meta.perPage ?? 10
    meta.total = res.meta.total ?? 0
    meta.lastPage = res.meta.totalPages ?? res.meta.lastPage ?? 1
  }
  // Trường hợp 2: BE trả lồng meta theo chuẩn mặc định của Lucid (Ví dụ: users_controller)
  else if (res.data && res.data.meta && Array.isArray(res.data.data)) {
    items = res.data.data
    const rawMeta = res.data.meta
    meta.currentPage = rawMeta.currentPage ?? rawMeta.current_page ?? 1
    meta.perPage = rawMeta.perPage ?? rawMeta.per_page ?? 10
    meta.total = rawMeta.total ?? 0
    meta.lastPage = rawMeta.lastPage ?? rawMeta.last_page ?? 1
    meta.firstPage = rawMeta.firstPage ?? rawMeta.first_page ?? 1
  }

  return { data: items, meta }
}

const refreshAccessToken = async (failedToken?: string): Promise<string> => {
  const state = getRefreshState()

  if (state.isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      state.queue.push({ resolve, reject })
    })
  }

  state.isRefreshing = true
  const nuxtApp = tryUseNuxtApp()

  try {
    const performRefresh = async () => {
      const refreshTokenStr = useCookie('refresh_token').value
      if (!refreshTokenStr) throw new Error('No refresh token available')

      const refreshRes = await $fetch<ApiResponse<LoginResponse>>('/auth/refresh', {
        baseURL: useRuntimeConfig().public.apiBaseUrl as string,
        method: 'POST',
        body: { refreshToken: refreshTokenStr }
      })

      const newToken = refreshRes.data?.accessToken
      if (newToken) {
        const isProd = process.env.NODE_ENV === 'production'
        useCookie('auth_token', { secure: isProd, sameSite: 'lax' }).value = newToken
        return newToken
      }
      throw new Error('Làm mới token thất bại')
    }

    const runRefresh = async () => {
      if (import.meta.client && 'locks' in navigator) {
        return await navigator.locks.request('refresh_token_lock', async () => {
          return nuxtApp
            ? await nuxtApp.runWithContext(async () => {
                const currentToken = useCookie('auth_token').value
                if (failedToken && currentToken && currentToken !== failedToken) {
                  return currentToken as string
                }
                return await performRefresh()
              })
            : await performRefresh()
        })
      } else if (import.meta.client) {
        while (true) {
          const currentToken = useCookie('auth_token').value
          if (failedToken && currentToken && currentToken !== failedToken) {
            return currentToken as string
          }
          const lock = parseInt(localStorage.getItem('refresh_lock') || '0')
          const now = Date.now()
          if (now - lock < 5000) {
            await new Promise((r) => setTimeout(r, 500))
            continue
          }
          localStorage.setItem('refresh_lock', now.toString())
          break
        }
        try {
          return await performRefresh()
        } finally {
          localStorage.removeItem('refresh_lock')
        }
      } else {
        return await performRefresh()
      }
    }

    const newToken = nuxtApp ? await nuxtApp.runWithContext(runRefresh) : await runRefresh()

    if (newToken) {
      state.queue.forEach((q) => q.resolve(newToken))
      state.queue = []
      return newToken
    }
    throw new Error('Làm mới token thất bại')
  } catch (error) {
    if (import.meta.client) {
      localStorage.removeItem('refresh_lock')
    }
    state.queue.forEach((q) => q.reject(error))
    state.queue = []

    if (nuxtApp) {
      nuxtApp.runWithContext(() => {
        const isProd = process.env.NODE_ENV === 'production'
        const cookieOptions = { secure: isProd, sameSite: 'lax' as const }
        useCookie('auth_token', cookieOptions).value = null
        useCookie('refresh_token', cookieOptions).value = null
        navigateTo('/login')
      })
    }
    throw error
  } finally {
    state.isRefreshing = false
  }
}

export const fetchWithAuth = async <T = unknown, R extends ResponseType = 'json'>(
  requestUrl: string,
  options: CustomFetchOptions<R> = {}
): Promise<T> => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token').value
  const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie', 'accept-language']) : null

  const defaultOptions: CustomFetchOptions<R> = {
    baseURL: config.public.apiBaseUrl as string,
    retry: (options.method || 'GET').toUpperCase() === 'GET' ? 1 : 0,
    retryDelay: 1000,
    timeout: 30000
  }

  const mergedOptions = defu(options, defaultOptions) as CustomFetchOptions<R>

  if (options.abortId) {
    if (abortControllers.has(options.abortId)) {
      abortControllers.get(options.abortId)?.abort()
    }
    const controller = new AbortController()
    abortControllers.set(options.abortId, controller)
    mergedOptions.signal = controller.signal
  }

  // Preserve original interceptors
  const originalOnRequest = mergedOptions.onRequest
  const originalOnResponse = mergedOptions.onResponse
  const originalOnResponseError = mergedOptions.onResponseError

  mergedOptions.onRequest = async (context) => {
    context.options.headers = new Headers(context.options.headers || {})

    if (token) {
      context.options.headers.set('Authorization', `Bearer ${token}`)
    }

    if (ssrHeaders?.cookie) {
      context.options.headers.set('cookie', ssrHeaders.cookie)
    }

    if (import.meta.client) {
      if (!context.options.headers.has('X-Timezone')) {
        context.options.headers.set('X-Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
      }
      if (!context.options.headers.has('Accept-Language') && navigator.language) {
        context.options.headers.set('Accept-Language', navigator.language)
      }
    } else if (ssrHeaders?.['accept-language'] && !context.options.headers.has('Accept-Language')) {
      context.options.headers.set('Accept-Language', ssrHeaders['accept-language'])
    }

    const method = (context.options.method || 'GET').toUpperCase()
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!context.options.headers.has('Idempotency-Key')) {
        context.options.headers.set('Idempotency-Key', generateIdempotencyKey())
      }
    }

    if (originalOnRequest) {
      await (Array.isArray(originalOnRequest)
        ? Promise.all(originalOnRequest.map((f) => f(context)))
        : originalOnRequest(context))
    }
  }

  mergedOptions.onResponse = async (context) => {
    const res = context.response as { status: number; _data?: Record<string, unknown> }
    if (
      import.meta.client &&
      res.status >= HttpStatus.OK &&
      res.status < HttpStatus.MULTIPLE_CHOICES
    ) {
      if (hasResponseMessage(res._data)) {
        tryUseNuxtApp()?.callHook('app:toast', {
          title: 'Thành công',
          description: res._data.message,
          color: 'success'
        })
      }
    }
    if (originalOnResponse) {
      await (Array.isArray(originalOnResponse)
        ? Promise.all(originalOnResponse.map((f) => f(context)))
        : originalOnResponse(context))
    }
  }

  mergedOptions.onResponseError = async (context) => {
    const res = context.response as { status: number; _data?: Record<string, unknown> } | undefined
    if (!res) return

    if (res.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const errors = res._data?.errors as Record<string, string | string[]> | undefined
      if (errors && res._data) {
        res._data.validationErrors = Object.entries(errors).map(([key, messages]) => ({
          path: key,
          message: Array.isArray(messages) ? messages[0] : messages
        }))
      }
    } else if (import.meta.client) {
      if (res.status === HttpStatus.TOO_MANY_REQUESTS) {
        let description = hasResponseMessage(res._data)
          ? res._data.message
          : 'Bạn thao tác quá nhanh, vui lòng thử lại sau.'

        const headers = context.response.headers as Headers | undefined
        const retryAfter = headers?.get?.('retry-after') || headers?.get?.('Retry-After')

        if (retryAfter) {
          description += ` Vui lòng chờ ${retryAfter} giây.`
        }

        tryUseNuxtApp()?.callHook('app:toast', {
          title: 'Cảnh báo',
          description,
          color: 'warning'
        })
      } else if (res.status !== HttpStatus.UNAUTHORIZED) {
        const errorCode = res._data?.errorCode as string | undefined
        const ignoreCodes = (context.options as CustomFetchOptions<R>).ignoreErrorCodes || []
        const isSilent =
          (context.options as CustomFetchOptions<R>).silent ||
          (!!errorCode && ignoreCodes.includes(errorCode))

        if (!isSilent) {
          const message = hasResponseMessage(res._data)
            ? res._data.message
            : 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại.'
          tryUseNuxtApp()?.callHook('app:toast', {
            title: 'Thất bại',
            description: message,
            color: 'error'
          })
        }
      }
    }

    if (originalOnResponseError) {
      await (Array.isArray(originalOnResponseError)
        ? Promise.all(originalOnResponseError.map((f) => f(context)))
        : originalOnResponseError(context))
    }
  }

  try {
    return await $fetch<T>(requestUrl, mergedOptions as Parameters<typeof $fetch>[1])
  } catch (error: unknown) {
    if ((error as Error)?.name === 'AbortError') {
      throw error
    }

    const fetchError = error as
      { response?: { status?: number }; message?: string } | null | undefined

    if (fetchError?.response?.status === HttpStatus.UNAUTHORIZED) {
      let failedToken: string | undefined
      if (mergedOptions.headers instanceof Headers) {
        failedToken = mergedOptions.headers.get('Authorization')?.replace('Bearer ', '')
      } else if (mergedOptions.headers && typeof mergedOptions.headers === 'object') {
        const authHeader = (mergedOptions.headers as Record<string, string>).Authorization
        if (authHeader) failedToken = authHeader.replace('Bearer ', '')
      }

      const newToken = await refreshAccessToken(failedToken)
      mergedOptions.headers = new Headers(mergedOptions.headers || {})
      mergedOptions.headers.set('Authorization', `Bearer ${newToken}`)

      return await $fetch<T>(requestUrl, mergedOptions as Parameters<typeof $fetch>[1])
    }

    const logData = {
      level: 'ERROR',
      type: 'API_FETCH_ERROR',
      method: mergedOptions.method || 'GET',
      url: requestUrl,
      status: fetchError?.response?.status || 'UNKNOWN',
      message: fetchError?.message || String(error),
      timestamp: new Date().toISOString()
    }

    if (import.meta.server) {
      console.error(JSON.stringify(logData))
    } else {
      console.error('[API_FETCH_ERROR]', logData)
    }

    throw error
  } finally {
    if (options.abortId && abortControllers.get(options.abortId)?.signal === mergedOptions.signal) {
      abortControllers.delete(options.abortId)
    }
  }
}

// --- API EXPORTS ---
export const ApiClient = {
  get<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, unknown>,
    opts?: FetchOptions<R>
  ) {
    return fetchWithAuth<T, R>(url, { method: 'GET', query, ...opts } as CustomFetchOptions<R>)
  },

  post<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return fetchWithAuth<T, R>(url, { method: 'POST', body, ...opts } as CustomFetchOptions<R>)
  },

  put<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return fetchWithAuth<T, R>(url, { method: 'PUT', body, ...opts } as CustomFetchOptions<R>)
  },

  patch<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return fetchWithAuth<T, R>(url, { method: 'PATCH', body, ...opts } as CustomFetchOptions<R>)
  },

  del<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, unknown>,
    opts?: FetchOptions<R>
  ) {
    return fetchWithAuth<T, R>(url, { method: 'DELETE', query, ...opts } as CustomFetchOptions<R>)
  },

  upload<T = unknown>(
    url: string,
    fileData: FormData,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<T> {
    const executeUpload = async (token: string | null | undefined): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!import.meta.client) {
          return reject(new Error('Upload file chỉ được thực hiện trên trình duyệt (Client-side)'))
        }

        const config = useRuntimeConfig()
        const xhr = new XMLHttpRequest()

        const fullUrl = url.startsWith('http') ? url : `${config.public.apiBaseUrl}${url}`
        xhr.open('POST', fullUrl, true)

        let abortHandler: (() => void) | undefined

        const cleanup = () => {
          if (signal && abortHandler) {
            signal.removeEventListener('abort', abortHandler)
          }
        }

        if (signal) {
          if (signal.aborted) {
            return reject(new Error('AbortError'))
          }
          abortHandler = () => {
            xhr.abort()
            reject(new Error('AbortError'))
          }
          signal.addEventListener('abort', abortHandler)
        }

        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        
        xhr.setRequestHeader('Idempotency-Key', generateIdempotencyKey())

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              onProgress(Math.round((event.loaded / event.total) * 100))
            }
          }
        }

        xhr.onload = () => {
          cleanup()
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              resolve(xhr.responseText as unknown as T)
            }
          } else if (xhr.status === HttpStatus.UNAUTHORIZED) {
            reject({ status: HttpStatus.UNAUTHORIZED, responseText: xhr.responseText })
          } else {
            reject({ status: xhr.status, responseText: xhr.responseText })
          }
        }

        xhr.onerror = () => {
          cleanup()
          reject(new Error('Network Error during upload'))
        }
        xhr.send(fileData)
      })
    }

    const currentToken = useCookie('auth_token').value
    return executeUpload(currentToken).catch(async (err) => {
      if ((err as Error)?.message === 'AbortError') throw err

      if (err?.status === HttpStatus.UNAUTHORIZED) {
        const newToken = await refreshAccessToken(currentToken || undefined)
        return executeUpload(newToken)
      }
      throw err
    })
  },

  async download(
    url: string,
    query?: Record<string, unknown>,
    defaultFilename = 'download_file',
    signal?: AbortSignal
  ): Promise<void> {
    if (!import.meta.client) {
      throw new Error('Download file chỉ được thực hiện trên trình duyệt (Client-side)')
    }

    const config = useRuntimeConfig()

    const handleBlob = (blob: Blob, filename: string) => {
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
    }

    const executeDownload = async (token: string | null | undefined): Promise<void> => {
      const defaultOptions: CustomFetchOptions<'blob'> = {
        baseURL: config.public.apiBaseUrl as string,
        method: 'GET',
        query,
        signal,
        responseType: 'blob',
        retry: 1,
        retryDelay: 1000,
        timeout: 30000,
        onRequest: ({ options }) => {
          if (token) {
            options.headers = new Headers(options.headers || {})
            options.headers.set('Authorization', `Bearer ${token}`)
          }
        },
        onResponseError: async (context) => {
          const res = context.response as
            { status: number; _data?: Record<string, unknown> } | undefined
          if (!res) return
          if (import.meta.client && res.status !== HttpStatus.UNAUTHORIZED) {
            const message = hasResponseMessage(res._data) ? res._data.message : 'Lỗi tải file.'
            tryUseNuxtApp()?.callHook('app:toast', {
              title: 'Thất bại',
              description: message,
              color: 'error'
            })
          }
        }
      }

      const response = await $fetch.raw<Blob>(url, defaultOptions as Parameters<typeof $fetch>[1])
      const blob = response._data
      if (!blob) throw new Error('No data received')

      let filename = defaultFilename
      const contentDisposition = response.headers.get('content-disposition')
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      handleBlob(blob, filename)
    }

    const currentToken = useCookie('auth_token').value
    return executeDownload(currentToken).catch(async (error: unknown) => {
      const fetchError = error as { response?: { status?: number }; message?: string } | null | undefined
      if (fetchError?.message === 'AbortError' || (error as Error)?.name === 'AbortError') {
        throw error
      }
      
      if (fetchError?.response?.status === HttpStatus.UNAUTHORIZED) {
        const newToken = await refreshAccessToken(currentToken || undefined)
        return executeDownload(newToken)
      }
      
      console.error('[API_DOWNLOAD_ERROR]', error)
      throw error
    })
  }
}
