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
  const sortBy = ref((route.query.sortBy as string) || '')
  const sortOrder = ref<'asc' | 'desc'>((route.query.sortOrder as 'asc' | 'desc') || 'desc')
  const filters = ref<F>({ ...defaultFilters } as F)

  // --- Pagination tích hợp ---
  const pagination = usePagination()

  // --- Debounce Search (300ms) ---
  watchDebounced(
    searchQuery,
    (val) => {
      debouncedSearch.value = val
      pagination.resetPage()
      syncToUrl()
    },
    { debounce: 300 }
  )

  // --- Auto-reset page khi filter thay đổi ---
  watch(
    filters,
    () => {
      pagination.resetPage()
      syncToUrl()
    },
    { deep: true }
  )

  // --- Sync URL ---
  const syncToUrl = () => {
    const query: Record<string, string> = {
      ...route.query,
      page: pagination.page.value.toString(),
      pageSize: pagination.pageSize.value.toString()
    }

    if (debouncedSearch.value) {
      query.search = debouncedSearch.value
    } else {
      delete query.search
    }

    if (sortBy.value) {
      query.sortBy = sortBy.value
      query.sortOrder = sortOrder.value
    }

    router.replace({ query })
  }

  // --- Sort ---
  const toggleSort = (field: string) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
    pagination.resetPage()
    syncToUrl()
  }

  /**
   * Tổng hợp tất cả params để gửi API.
   * Dùng trực tiếp: useApiGet('/customers', queryParams.value)
   */
  const queryParams = computed(() => ({
    page: pagination.page.value,
    pageSize: pagination.pageSize.value,
    search: debouncedSearch.value || undefined,
    sortBy: sortBy.value || undefined,
    sortOrder: sortBy.value ? sortOrder.value : undefined,
    ...filters.value
  }))

  /**
   * Reset toàn bộ về trạng thái ban đầu.
   */
  const resetAll = () => {
    searchQuery.value = ''
    debouncedSearch.value = ''
    sortBy.value = ''
    sortOrder.value = 'desc'
    filters.value = { ...defaultFilters } as F
    pagination.resetPage()
    syncToUrl()
  }

  return {
    // Search
    searchQuery,
    debouncedSearch: readonly(debouncedSearch),
    // Sort
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),
    toggleSort,
    // Filters
    filters,
    // Pagination (delegate)
    ...pagination,
    // Aggregated
    queryParams,
    // Actions
    resetAll
  }
}
