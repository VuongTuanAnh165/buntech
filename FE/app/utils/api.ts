// No any allowed
import type { FetchOptions, ResponseType, FetchContext } from 'ofetch'
import { defu } from 'defu'
import { HttpStatus } from '~/enums/http'
import type { ApiResponse } from '~/types/api'
import type { LoginResponse } from '~/types/auth'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type CustomFetchOptions<R extends ResponseType = 'json'> = FetchOptions<R>

// --- REFRESH STATE ---
type RefreshResolve = (value?: string) => void
type RefreshReject = (reason?: unknown) => void
type RefreshQueueItem = { resolve: RefreshResolve; reject: RefreshReject }

interface RefreshState {
  isRefreshing: boolean
  queue: RefreshQueueItem[]
}

const ssrStateMap = new WeakMap<object, RefreshState>()
const clientState: RefreshState = { isRefreshing: false, queue: [] }

function getRefreshState(): RefreshState {
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

// --- HTTP INTERCEPTOR ---
function onRequest<R extends ResponseType>(
  options: CustomFetchOptions<R>,
  token: string | null | undefined
) {
  if (token) {
    options.headers = new Headers(options.headers || {})
    options.headers.set('Authorization', `Bearer ${token}`)
  }
}

function onResponse<R extends ResponseType>(response: unknown, _options: CustomFetchOptions<R>) {
  const res = response as { status: number; _data?: Record<string, unknown> }
  if (import.meta.client) {
    if (res.status >= HttpStatus.OK && res.status < HttpStatus.MULTIPLE_CHOICES) {
      const message = res._data?.message as string | undefined
      if (message) {
        tryUseNuxtApp()?.callHook('app:toast', {
          title: 'Thành công',
          description: message,
          color: 'success'
        })
      }
    }
  }
}

async function onError<R extends ResponseType>(
  context: FetchContext & { options: CustomFetchOptions<R> }
) {
  const { response } = context
  if (!response) return
  const res = response as { status: number; _data?: Record<string, unknown> }

  // 1. Validate Errors (422)
  if (res.status === HttpStatus.UNPROCESSABLE_ENTITY) {
    const errors = res._data?.errors as Record<string, string | string[]> | undefined
    if (errors && res._data) {
      res._data.validationErrors = Object.entries(errors).map(([key, messages]) => ({
        path: key,
        message: Array.isArray(messages) ? messages[0] : messages
      }))
    }
    return
  }

  if (import.meta.client) {
    if (res.status !== HttpStatus.UNAUTHORIZED) {
      const message =
        (res._data?.message as string) || 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại.'
      tryUseNuxtApp()?.callHook('app:toast', {
        title: 'Thất bại',
        description: message,
        color: 'error'
      })
    }
  }
}

async function handleUnauthorizedRetry<T, R extends ResponseType>(
  requestUrl: string,
  options: CustomFetchOptions<R>
): Promise<T> {
  const state = getRefreshState()

  if (state.isRefreshing) {
    return new Promise<string | undefined>((resolve, reject) => {
      state.queue.push({ resolve, reject })
    }).then((newToken) => {
      if (newToken) {
        options.headers = new Headers(options.headers || {})
        options.headers.set('Authorization', `Bearer ${newToken}`)
      }
      return $fetch<T>(requestUrl, options as Parameters<typeof $fetch>[1])
    })
  }

  state.isRefreshing = true
  const nuxtApp = tryUseNuxtApp()

  try {
    const runRefresh = async () => {
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
        options.headers = new Headers(options.headers || {})
        options.headers.set('Authorization', `Bearer ${newToken}`)
      }
      return newToken
    }

    const newToken = nuxtApp ? await nuxtApp.runWithContext(runRefresh) : await runRefresh()

    if (newToken) {
      state.queue.forEach((q) => q.resolve(newToken))
      state.queue = []
      return $fetch<T>(requestUrl, options as Parameters<typeof $fetch>[1])
    }
    throw new Error('Làm mới token thất bại')
  } catch (error) {
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

// --- API CLIENT CORE ---
async function request<T, R extends ResponseType = 'json'>(
  method: HttpMethod,
  url: string,
  data?: unknown,
  opts?: FetchOptions<R>
): Promise<T> {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token').value

  const defaultOptions: CustomFetchOptions<R> = {
    baseURL: config.public.apiBaseUrl as string,
    method,
    onRequest: ({ options }) => onRequest(options as CustomFetchOptions, token),
    onResponse: ({ response, options }) => onResponse(response, options as CustomFetchOptions),
    onResponseError: (context) => onError(context as FetchContext & { options: CustomFetchOptions })
  }

  if (data) {
    if (method === 'GET' || method === 'DELETE') {
      defaultOptions.query = data
    } else {
      defaultOptions.body = data
    }
  }
  const mergedOptions = defu(opts, defaultOptions) as CustomFetchOptions<R>

  try {
    return await $fetch<T>(url, mergedOptions as Parameters<typeof $fetch>[1])
  } catch (error: unknown) {
    const fetchError = error as
      { response?: { status?: number }; message?: string } | null | undefined

    // Xử lý riêng lỗi 401 Unauthorized để refresh token
    if (fetchError?.response?.status === HttpStatus.UNAUTHORIZED) {
      return handleUnauthorizedRetry<T, R>(url, mergedOptions)
    }

    // Structured Logging cho các lỗi còn lại
    const logData = {
      level: 'ERROR',
      type: 'API_FETCH_ERROR',
      method,
      url,
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
  }
}

// --- API EXPORTS ---
export const ApiClient = {
  get<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, unknown>,
    opts?: FetchOptions<R>
  ) {
    return request<T, R>('GET', url, query, opts)
  },

  post<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return request<T, R>('POST', url, body, opts)
  },

  put<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return request<T, R>('PUT', url, body, opts)
  },

  patch<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    body?: unknown,
    opts?: FetchOptions<R>
  ) {
    return request<T, R>('PATCH', url, body, opts)
  },

  del<T = unknown, R extends ResponseType = 'json'>(
    url: string,
    query?: Record<string, unknown>,
    opts?: FetchOptions<R>
  ) {
    return request<T, R>('DELETE', url, query, opts)
  },

  upload<T = unknown>(
    url: string,
    fileData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!import.meta.client) {
        return reject(new Error('Upload file chỉ được thực hiện trên trình duyệt (Client-side)'))
      }

      const config = useRuntimeConfig()
      const token = useCookie('auth_token').value
      const xhr = new XMLHttpRequest()

      const fullUrl = url.startsWith('http') ? url : `${config.public.apiBaseUrl}${url}`
      xhr.open('POST', fullUrl, true)

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100))
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            resolve(xhr.responseText as unknown as T)
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
