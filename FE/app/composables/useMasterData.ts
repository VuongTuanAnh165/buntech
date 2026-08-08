import { getDivisionsVersion, getDivisionsTree } from '~/services/masterDataService'

/**
 * Composable quản lý dữ liệu Master Data (Tỉnh thành...).
 * Sử dụng useState để đảm bảo Global Reactivity (Share state giữa các component).
 * Chỉ đọc/ghi LocalStorage trên Client (tránh Hydration Mismatch & quá tải Server).
 */
export const useMasterData = () => {
  const version = useState<string | null>('master_data_version', () => null)
  const divisions = useState<unknown[]>('administrative_divisions', () => [])

  const initSync = async () => {
    // 1. Khôi phục từ LocalStorage (nếu có) để component render ngay lập tức
    if (!version.value) {
      version.value = localStorage.getItem('master_data_version')
    }
    if (!divisions.value.length) {
      const cached = localStorage.getItem('administrative_divisions')
      if (cached) {
        try {
          divisions.value = JSON.parse(cached)
        } catch (e) {
          console.error('[MasterData] Lỗi parse JSON từ LocalStorage', e)
        }
      }
    }

    // 2. Fetch version từ API để kiểm tra xem có cần cập nhật không
    try {
      const versionRes = await getDivisionsVersion()
      if (versionRes?.success && versionRes?.data?.versionHash) {
        const serverVersion = versionRes.data.versionHash

        // 3. Nếu version khác nhau hoặc chưa có data -> Fetch data mới
        if (version.value !== serverVersion || !divisions.value.length) {
          const divisionsRes = await getDivisionsTree()
          if (divisionsRes?.success) {
            divisions.value = divisionsRes.data || []
            version.value = serverVersion

            // 4. Lưu vào LocalStorage để dùng cho lần sau
            localStorage.setItem('administrative_divisions', JSON.stringify(divisionsRes.data))
            localStorage.setItem('master_data_version', serverVersion)
            console.log('[MasterData] Đã tải và lưu phiên bản mới:', serverVersion)
          }
        } else {
          console.log('[MasterData] Đang dùng phiên bản từ Cache:', serverVersion)
        }
      }
    } catch (e) {
      console.error('[MasterData] Lỗi đồng bộ dữ liệu:', e)
    }
  }

  return {
    version,
    divisions,
    initSync
  }
}
