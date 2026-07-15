/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocalStorage } from '@vueuse/core'
import { getDivisionsVersion, getDivisionsTree } from '~/services/masterDataService'

export const useMasterData = () => {
  const version = useLocalStorage<string | null>('master_data_version', null)
  const divisions = useLocalStorage<any[]>('administrative_divisions', [])

  const initSync = async () => {
    try {
      // Fetch version
      const versionRes = await getDivisionsVersion()
      if (versionRes?.success && versionRes?.data?.versionHash) {
        const serverVersion = versionRes.data.versionHash

        if (version.value !== serverVersion || !divisions.value.length) {
          // Version changed or no data, fetch new data
          const divisionsRes = await getDivisionsTree()
          if (divisionsRes?.success) {
            divisions.value = divisionsRes.data
            version.value = serverVersion
            console.log('[MasterData] Synced new administrative divisions version:', serverVersion)
          }
        } else {
          console.log('[MasterData] Using cached administrative divisions version:', serverVersion)
        }
      }
    } catch (e) {
      console.error('[MasterData] Failed to sync master data:', e)
    }
  }

  return {
    version,
    divisions,
    initSync
  }
}
