import type { PaginationMeta } from '~/types/api'

/**
 * Composable quản lý state phân trang.
 * Tự động sync với URL query params.
 *
 * @example
 * const { page, pageSize, total, from, to, updateMeta } = usePagination()
 */
export const usePagination = (defaultPageSize = 20) => {
  const route = useRoute()
  const router = useRouter()

  // --- State (đọc từ URL hoặc dùng mặc định) ---
  const page = ref(Number(route.query.page) || 1)
  const pageSize = ref(Number(route.query.pageSize) || defaultPageSize)
  const total = ref(0)
  const totalPages = ref(0)

  // --- Computed ---

  /** Bản ghi bắt đầu hiển thị (1-indexed). VD: "Xem từ 21..." */
  const from = computed(() => {
    if (total.value === 0) return 0
    return (page.value - 1) * pageSize.value + 1
  })

  /** Bản ghi kết thúc hiển thị. VD: "...đến 40" */
  const to = computed(() => {
    return Math.min(page.value * pageSize.value, total.value)
  })

  // --- Methods ---

  /**
   * Sync state phân trang lên URL query params.
   */
  const syncToUrl = () => {
    router.replace({
      query: {
        ...route.query,
        page: page.value.toString(),
        pageSize: pageSize.value.toString()
      }
    })
  }

  const goToPage = (p: number) => {
    page.value = Math.max(1, Math.min(p, totalPages.value || 1))
    syncToUrl()
  }

  const nextPage = () => {
    if (page.value < totalPages.value) goToPage(page.value + 1)
  }

  const prevPage = () => {
    if (page.value > 1) goToPage(page.value - 1)
  }

  const changePageSize = (size: number) => {
    pageSize.value = size
    page.value = 1 // Reset về trang 1 khi đổi page size
    syncToUrl()
  }

  /**
   * Cập nhật meta từ API response.
   * Gọi sau mỗi lần fetch data thành công.
   */
  const updateMeta = (meta: PaginationMeta) => {
    total.value = meta.total
    totalPages.value = meta.totalPages
    page.value = meta.page
    pageSize.value = meta.pageSize
  }

  /**
   * Reset về trang 1 (dùng khi search/filter thay đổi).
   */
  const resetPage = () => {
    page.value = 1
    syncToUrl()
  }

  return {
    // State
    page: readonly(page),
    pageSize: readonly(pageSize),
    total: readonly(total),
    totalPages: readonly(totalPages),
    // Computed
    from,
    to,
    // Methods
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    updateMeta,
    resetPage
  }
}
