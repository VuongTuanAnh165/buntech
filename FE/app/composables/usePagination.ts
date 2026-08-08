import { ref, computed } from 'vue'

export interface PaginationParams {
  page: number
  limit: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function usePagination(initialLimit = 10) {
  const page = ref(1)
  const limit = ref(initialLimit)
  const total = ref(0)
  const search = ref('')
  const sortBy = ref('')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)
  const from = computed(() => (page.value - 1) * limit.value)
  const to = computed(() => Math.min(from.value + limit.value - 1, total.value - 1))

  const nextPage = () => {
    if (hasNext.value) page.value++
  }
  const prevPage = () => {
    if (hasPrev.value) page.value--
  }
  const goToPage = (p: number) => {
    page.value = Math.max(1, Math.min(p, totalPages.value))
  }
  const changeLimit = (l: number) => {
    limit.value = l
    page.value = 1
  }
  const reset = () => {
    page.value = 1
  }
  const toggleSort = (column: string) => {
    if (sortBy.value === column) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = column
      sortOrder.value = 'asc'
    }
  }

  return {
    page, limit, total, search, sortBy, sortOrder,
    totalPages, hasNext, hasPrev, from, to,
    nextPage, prevPage, goToPage, changeLimit, reset, toggleSort,
  }
}
