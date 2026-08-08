import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export const getDivisionsVersion = () => {
  return ApiClient.get<ApiResponse<{ versionHash: string | null }>>(
    '/master-data/divisions/version'
  )
}

export const getDivisionsTree = () => {
  return ApiClient.get<ApiResponse<unknown[]>>('/master-data/divisions')
}
