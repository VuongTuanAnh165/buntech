import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export const getDivisionsVersion = () => {
  return ApiClient.get<ApiResponse<{ versionHash: string | null }>>(
    '/master-data/divisions/version'
  )
}

export const getDivisionsTree = (
  versionHash?: string,
  onResponse?: (context: { response?: { headers?: { get: (n: string) => string | null } } }) => void
) => {
  const headers: Record<string, string> = {}
  if (versionHash) {
    headers['If-None-Match'] = versionHash
  }
  return ApiClient.get<ApiResponse<unknown[]>>('/master-data/divisions', undefined, {
    headers,
    onResponse,
    silent: true
  })
}

export const getConstants = () => {
  return ApiClient.get<ApiResponse<Record<string, Record<string, string>>>>('/constants')
}
