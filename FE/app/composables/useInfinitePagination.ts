import type { PaginationMeta } from '~/types/api'

/**
 * Composable quản lý state phân trang dạng mảng nối tiếp (Infinite Scroll / Load More).
 * Thích hợp cho Capacitor (Mobile App) hoặc giao diện danh sách cuộn liên tục.
 * Không tự động đồng bộ lên URL params để tránh làm rối lịch sử trình duyệt.
 *
 * @example
 * const { items, page, isFinished, loadMore, appendData, reset } = useInfinitePagination<Customer>()
 */
export const useInfinitePagination = <T>(defaultPageSize = 20) => {
  const items = ref<T[]>([]) as Ref<T[]>
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const totalPages = ref(0)

  // Kiểm tra xem đã tải hết dữ liệu chưa
  const isFinished = computed(() => {
    return totalPages.value > 0 && page.value >= totalPages.value
  })

  /**
   * Tăng số trang lên 1 nếu chưa tải hết.
   * Cần kết hợp watch `page` hoặc gọi API thủ công sau khi gọi hàm này.
   */
  const loadMore = () => {
    if (!isFinished.value) {
      page.value++
    }
  }

  /**
   * Cập nhật danh sách data và meta phân trang từ API response.
   * Nếu ở trang 1, mảng sẽ bị ghi đè (Reset Data).
   * Nếu ở trang > 1, mảng sẽ được nối thêm (Append Data).
   *
   * @param newItems Mảng dữ liệu mới từ API
   * @param meta Đối tượng PaginationMeta từ API
   */
  const appendData = (newItems: T[], meta: PaginationMeta) => {
    if (meta.currentPage === 1) {
      items.value = newItems
    } else {
      items.value.push(...newItems)
    }

    total.value = meta.total
    totalPages.value = meta.lastPage
    page.value = meta.currentPage
    pageSize.value = meta.perPage
  }

  /**
   * Đặt lại trạng thái về ban đầu (thường dùng khi bộ lọc search bị thay đổi).
   */
  const reset = () => {
    items.value = []
    page.value = 1
    total.value = 0
    totalPages.value = 0
  }

  return {
    // State
    items,
    page: readonly(page),
    pageSize: readonly(pageSize),
    limit: readonly(pageSize),
    total: readonly(total),
    totalPages: readonly(totalPages),
    // Computed
    isFinished,
    // Methods
    loadMore,
    appendData,
    reset
  }
}
