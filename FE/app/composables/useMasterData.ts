import { getDivisionsTree, getConstants } from '~/services/masterDataService'

/**
 * Composable quản lý dữ liệu Master Data (Tỉnh thành, Constants).
 * Sử dụng useState để đảm bảo Global Reactivity.
 * Dùng ETag và If-None-Match để tránh tải lại file tĩnh lớn.
 */
export const useMasterData = () => {
  const version = useState<string | null>('master_data_version', () => null)
  const divisions = useState<unknown[]>('administrative_divisions', () => [])
  const constants = useState<Record<string, Record<string, string>> | null>(
    'master_data_constants',
    () => null
  )

  const initSync = async () => {
    // 1. Khôi phục từ LocalStorage (Client-side)
    if (import.meta.client) {
      if (!version.value) version.value = localStorage.getItem('master_data_version')
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

    // 2. Fetch Constants
    try {
      getConstants()
        .then((res) => {
          if (res?.success && res.data) {
            constants.value = res.data
            if (import.meta.client) {
              localStorage.setItem('master_data_constants', JSON.stringify(res.data))
            }
          }
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('[MasterData] Lỗi tải constants', e)
        })
    } catch {
      // ignore
    }

    // 3. Fetch Divisions với ETag (If-None-Match)
    try {
      const currentHash = version.value || undefined
      let newEtag: string | null = null

      await getDivisionsTree(
        currentHash,
        (context: { response?: { headers?: { get: (n: string) => string | null } } }) => {
          const etag =
            context.response?.headers?.get('etag') || context.response?.headers?.get('ETag')
          if (etag) newEtag = etag
        }
      )
        .then((res) => {
          if (res?.success && res.data) {
            divisions.value = res.data
            if (newEtag) version.value = newEtag

            if (import.meta.client) {
              localStorage.setItem('administrative_divisions', JSON.stringify(res.data))
              if (newEtag) localStorage.setItem('master_data_version', newEtag)
            }
          }
        })
        .catch((e: { response?: { status?: number } }) => {
          if (e?.response?.status === 304) {
            // Data không đổi
          } else {
            // eslint-disable-next-line no-console
            console.error('[MasterData] Lỗi tải divisions:', e)
          }
        })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[MasterData] Lỗi đồng bộ divisions:', e)
    }
  }

  return {
    version,
    divisions,
    constants,
    initSync
  }
}
