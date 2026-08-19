import { publicCustomerService } from '~/services/publicCustomerService'
import type { PublicCustomer } from '~/services/publicCustomerService'

export function usePublicCustomers() {
  const searchQuery = ref('')

  const { data: rawData, status } = useAsyncData('public-customers', () =>
    publicCustomerService.fetchPublicCustomers()
  )

  const customers = computed<PublicCustomer[]>(() => rawData.value?.data ?? [])

  const filteredCustomers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return customers.value

    return customers.value.filter((c) => {
      const storeName = (c.storeName ?? '').toLowerCase()
      const fullName = c.fullName.toLowerCase()
      const provinces = c.addresses.map((a) => (a.province ?? '').toLowerCase()).join(' ')

      return storeName.includes(query) || fullName.includes(query) || provinces.includes(query)
    })
  })

  const customersWithCoords = computed(() =>
    filteredCustomers.value.flatMap((c) =>
      c.addresses
        .filter((a) => a.latitude !== null && a.longitude !== null)
        .map((a) => ({ customer: c, address: a }))
    )
  )

  return {
    customers,
    filteredCustomers,
    customersWithCoords,
    searchQuery,
    status
  }
}
