import { driverService, type DriverRouteDTO } from '~/services/driverService'
import type { PaginationParams } from '~/types/api'

export const useDriverHistory = () => {
  const params = reactive<
    PaginationParams & { status?: string; dateFrom?: string; dateTo?: string }
  >({
    page: 1,
    limit: 20
  })

  const {
    data: historyResponse,
    status,
    error,
    refresh
  } = useAsyncData('driver-history', () => driverService.getHistory(params), {
    watch: [params]
  })

  const history = computed(() => historyResponse.value?.data.data || [])
  const meta = computed(() => historyResponse.value?.data.meta)
  const loading = computed(() => status.value === 'pending')

  // Support load more by incrementing limit or page depending on implementation.
  // Given standard infinite scroll, usually we append. But for simplicity with asyncData watch,
  // we can just increase limit if the UI wants to show more at once, or we use a separate ref for all items.

  // Here is a common pattern for infinite load with Nuxt
  const allItems = ref<DriverRouteDTO[]>([])

  watch(
    history,
    (newItems) => {
      if (params.page === 1) {
        allItems.value = [...newItems]
      } else {
        allItems.value = [...allItems.value, ...newItems]
      }
    },
    { immediate: true }
  )

  const loadMore = () => {
    if (meta.value && meta.value.currentPage < meta.value.lastPage) {
      params.page = (params.page || 1) + 1
    }
  }

  const hasMore = computed(() => {
    if (!meta.value) return false
    return meta.value.currentPage < meta.value.lastPage
  })

  // Provide a method to completely reset and refresh
  const hardRefresh = async () => {
    params.page = 1
    await refresh()
  }

  return {
    params,
    history: allItems,
    meta,
    loading,
    error,
    refresh: hardRefresh,
    loadMore,
    hasMore
  }
}
