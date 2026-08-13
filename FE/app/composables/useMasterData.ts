import { masterDataService } from '~/services/masterDataService'
import type { MasterDataConstants, Division } from '~/types/masterData'

/**
 * Composable quản lý dữ liệu Master Data (Tỉnh thành, Constants).
 * Sử dụng useState để đảm bảo Global Reactivity.
 * Dùng ETag và If-None-Match để tránh tải lại file tĩnh lớn.
 */
export const useMasterData = () => {
  const version = useState<string | null>('master_data_version', () => null)
  const constantsVersion = useState<string | null>('master_data_constants_version', () => null)
  const divisions = useState<Division[]>('administrative_divisions', () => [])
  const constants = useState<MasterDataConstants | null>('master_data_constants', () => null)

  const initSync = async () => {
    // 1. Khôi phục từ LocalStorage (Client-side)
    if (import.meta.client) {
      if (!version.value) version.value = localStorage.getItem('master_data_version')
      if (!constantsVersion.value)
        constantsVersion.value = localStorage.getItem('master_data_constants_version')
      if (!divisions.value.length) {
        const cached = localStorage.getItem('administrative_divisions')
        if (cached) {
          try {
            divisions.value = JSON.parse(cached)
          } catch {
            // ignore
          }
        }
      }
      if (!constants.value) {
        const cachedConst = localStorage.getItem('master_data_constants')
        if (cachedConst) {
          try {
            constants.value = JSON.parse(cachedConst)
          } catch {
            // ignore
          }
        }
      }
    }

    // 2. Fetch Constants với ETag (If-None-Match)
    try {
      // Chỉ gửi ETag nếu Constants đã được load thành công vào bộ nhớ
      const currentConstHash = constants.value ? constantsVersion.value || undefined : undefined

      const data = await masterDataService.getConstants(currentConstHash, (newEtag) => {
        constantsVersion.value = newEtag
        if (import.meta.client) {
          localStorage.setItem('master_data_constants_version', newEtag)
        }
      })

      if (data) {
        constants.value = data
        if (import.meta.client) {
          localStorage.setItem('master_data_constants', JSON.stringify(data))
        }
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const responseError = e as { response?: { status?: number } }
        if (responseError.response?.status === 304) {
          // Data không đổi
        }
      }
    }

    // 3. Fetch Divisions với ETag (If-None-Match)
    try {
      // Chỉ gửi ETag nếu Divisions đã được load thành công vào bộ nhớ
      const currentHash = divisions.value.length > 0 ? version.value || undefined : undefined

      const divData = await masterDataService.getDivisions(currentHash, (newEtag) => {
        version.value = newEtag
        if (import.meta.client) {
          localStorage.setItem('master_data_version', newEtag)
        }
      })

      if (divData) {
        divisions.value = divData
        if (import.meta.client) {
          localStorage.setItem('administrative_divisions', JSON.stringify(divData))
        }
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        const responseError = e as { response?: { status?: number } }
        if (responseError.response?.status === 304) {
          // Data không đổi
        }
      } else {
        // console.error handled in service
      }
    }
  }

  return {
    version,
    divisions,
    constants,
    initSync
  }
}
