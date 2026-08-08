import type { ref} from 'vue';
import { watch } from 'vue'

export function useSyncQuery(params: {
  search?: ReturnType<typeof ref<string>>
  sortBy?: ReturnType<typeof ref<string>>
  sortDirection?: ReturnType<typeof ref<'asc' | 'desc'>>
  page?: ReturnType<typeof ref<number>>
  limit?: ReturnType<typeof ref<number>>
  statusFilter?: ReturnType<typeof ref<string>>
  roleFilter?: ReturnType<typeof ref<string>>
  typeFilter?: ReturnType<typeof ref<string>>
  startDate?: ReturnType<typeof ref<string>>
  endDate?: ReturnType<typeof ref<string>>
}) {
  const route = useRoute()
  const router = useRouter()

  const readFromQuery = () => {
    const q = route.query
    if (params.search && typeof q.search === 'string') params.search.value = q.search
    if (params.sortBy && typeof q.sortBy === 'string') params.sortBy.value = q.sortBy
    if (params.sortDirection && typeof q.sortDirection === 'string') {
      params.sortDirection.value = q.sortDirection as 'asc' | 'desc'
    }
    if (params.page && q.page) params.page.value = Number(q.page) || 1
    if (params.limit && q.limit) params.limit.value = Number(q.limit) || 10
    if (params.statusFilter && typeof q.status === 'string') params.statusFilter.value = q.status
    if (params.roleFilter && typeof q.role === 'string') params.roleFilter.value = q.role
    if (params.typeFilter && typeof q.type === 'string') params.typeFilter.value = q.type
    if (params.startDate && typeof q.startDate === 'string') params.startDate.value = q.startDate
    if (params.endDate && typeof q.endDate === 'string') params.endDate.value = q.endDate
  }

  const writeToQuery = () => {
    const query: Record<string, string> = {}
    if (params.search?.value) query.search = params.search.value
    if (params.sortBy?.value) query.sortBy = params.sortBy.value
    if (params.sortDirection?.value) query.sortDirection = params.sortDirection.value
    if (params.page?.value && params.page.value > 1) query.page = String(params.page.value)
    if (params.limit?.value && params.limit.value !== 10) query.limit = String(params.limit.value)
    if (params.statusFilter?.value) query.status = params.statusFilter.value
    if (params.roleFilter?.value) query.role = params.roleFilter.value
    if (params.typeFilter?.value) query.type = params.typeFilter.value
    if (params.startDate?.value) query.startDate = params.startDate.value
    if (params.endDate?.value) query.endDate = params.endDate.value

    router.replace({ query })
  }

  readFromQuery()

  const allRefs = Object.values(params).filter(Boolean)
  watch(allRefs, writeToQuery, { deep: true })

  return { readFromQuery, writeToQuery }
}
