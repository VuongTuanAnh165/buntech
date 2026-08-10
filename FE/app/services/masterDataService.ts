import { ApiClient } from '~/utils/api'
import type { MasterDataConstants, Division } from '~/types/masterData'

export const masterDataService = {
  async getConstants(currentVersion?: string, onNewEtag?: (etag: string) => void) {
    try {
      const headers: Record<string, string> = {}
      if (currentVersion) {
        headers['If-None-Match'] = currentVersion
      }

      const res = await ApiClient.get<{ data: MasterDataConstants }>('/constants', undefined, {
        headers,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onResponse: (context: any) => {
          const etag =
            context.response?.headers?.get('etag') || context.response?.headers?.get('ETag')
          if (etag) {
            onNewEtag?.(etag)
          }
        }
      })

      if (res?.data) {
        return res.data
      }
      return null
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const responseError = e as { response?: { status?: number } }
        if (responseError.response?.status === 304) {
          throw e
        }
      }
      return null
    }
  },

  async getDivisions(currentVersion?: string, onNewEtag?: (etag: string) => void) {
    try {
      const headers: Record<string, string> = {}
      if (currentVersion) {
        headers['If-None-Match'] = currentVersion
      }

      const res = await ApiClient.get<{ data: Division[] }>('/master-data/divisions', undefined, {
        headers,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onResponse: (context: any) => {
          const etag =
            context.response?.headers?.get('etag') || context.response?.headers?.get('ETag')
          if (etag) {
            onNewEtag?.(etag)
          }
        },
        silent: true // Prevents toast error popup on 304 if configured in ApiClient
      })

      if (res?.data) {
        return res.data
      }
      return null
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const responseError = e as { response?: { status?: number } }
        if (responseError.response?.status === 304) {
          throw e
        }
      }
      throw e
    }
  }
}
