/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export const getDivisionsVersion = () => {
  return ApiClient.get<ApiResponse<{ versionHash: string | null }>>(
    '/master-data/divisions/version'
  )
}

export const getDivisionsTree = () => {
  return ApiClient.get<ApiResponse<any[]>>('/master-data/divisions')
}
