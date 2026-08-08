import { watchDebounced } from '@vueuse/core'

/**
 * Composable kết hợp Search + Filter + Sort + Pagination cho Table.
 * Debounced search, auto-reset page khi thay đổi filter, sync URL.
 *
 * @example
 * const { searchQuery, filters, sortBy, sortOrder, queryParams } = useTableFilters()
 */
export const useTableFilters = <F extends Record<string, unknown> = Record<string, unknown>>(
  defaultFilters?: F
) => {
  const route = useRoute()
  const router = useRouter()

  // --- State ---
  const searchQuery = ref((route.query.search as string) || '')
  const debouncedSearch = ref(searchQuery.value)
  const filters = ref<F>({ ...defaultFilters } as F)

  // --- Pagination tích hợp ---
  const pagination = usePagination()

  // --- Initialize Pagination ---
  if (route.query.sortBy) pagination.sortBy.value = route.query.sortBy as string
  if (route.query.sortOrder) pagination.sortOrder.value = route.query.sortOrder as 'asc' | 'desc'
  if (route.query.page) pagination.page.value = Number(route.query.page)
  if (route.query.limit) pagination.limit.value = Number(route.query.limit)

  // --- Debounce Search (300ms) ---
  watchDebounced(
    searchQuery,
    (val) => {
      debouncedSearch.value = val
      pagination.reset()
      syncToUrl()
    },
    { debounce: 300 }
  )

  // --- Auto-reset page khi filter thay đổi ---
  watch(
    filters,
    () => {
      pagination.reset()
      syncToUrl()
    },
    { deep: true }
  )

  // --- Sync URL ---
  const syncToUrl = () => {
    const query: Record<string, string> = {
      ...route.query,
      page: pagination.page.value.toString(),
      limit: pagination.limit.value.toString()
    }

    if (debouncedSearch.value) {
      query.search = debouncedSearch.value
    } else {
      delete query.search
    }

    if (pagination.sortBy.value) {
      query.sortBy = pagination.sortBy.value
      query.sortOrder = pagination.sortOrder.value
    }

    router.replace({ query })
  }

  const customToggleSort = (field: string) => {
    pagination.toggleSort(field)
    pagination.reset()
    syncToUrl()
  }

  /**
   * Tổng hợp tất cả params để gửi API.
   * Dùng trực tiếp: useApiGet('/customers', queryParams.value)
   */
  const queryParams = computed(() => ({
    page: pagination.page.value,
    limit: pagination.limit.value,
    search: debouncedSearch.value || undefined,
    sortBy: pagination.sortBy.value || undefined,
    sortOrder: pagination.sortBy.value ? pagination.sortOrder.value : undefined,
    ...filters.value
  }))

  /**
   * Reset toàn bộ về trạng thái ban đầu.
   */
  const resetAll = () => {
    searchQuery.value = ''
    debouncedSearch.value = ''
    pagination.sortBy.value = ''
    pagination.sortOrder.value = 'desc'
    filters.value = { ...defaultFilters } as F
    pagination.reset()
    syncToUrl()
  }

  return {
    // Search
    searchQuery,
    debouncedSearch: readonly(debouncedSearch),
    // Filters
    filters,
    // Pagination (delegate)
    ...pagination,
    toggleSort: customToggleSort,
    // Aggregated
    queryParams,
    // Actions
    resetAll
  }
}

