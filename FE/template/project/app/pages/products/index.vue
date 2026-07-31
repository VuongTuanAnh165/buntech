<script setup lang="ts">
import { mockProducts, mockCategories } from '~/core/mockData'

const { t } = useI18n()
const nuxt = useNuxtApp()
const { formatVND } = useFormat()
useHead({ title: `${t('customer.ourProducts')} - BunTech` })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const products = ref<Record<string, unknown>[]>([])
const categories = ref<Record<string, unknown>[]>([])
const selectedCategory = ref('')
const search = ref('')

const debouncedSearch = useDebounce(search, 300)
watch([debouncedSearch, selectedCategory], loadData)

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = mockProducts.value.filter(p => !p.deleted_at && p.status === 'ACTIVE')
    if (debouncedSearch.value) {
      data = data.filter(p => p.name.toLowerCase().includes(debouncedSearch.value.toLowerCase()))
    }
    if (selectedCategory.value) {
      data = data.filter(p => p.category_id === selectedCategory.value)
    }
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    products.value = data as Record<string, unknown>[]
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  await new Promise(r => setTimeout(r, 300))
  categories.value = mockCategories.value.slice().sort((a, b) => a.name.localeCompare(b.name)) as Record<string, unknown>[]
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('customer.ourProducts') }}</h1>
    <div class="flex flex-wrap items-center gap-3 mb-8">
      <div class="flex-1 min-w-[200px] max-w-xs"><AppSearchBar v-model="search" /></div>
      <select v-model="selectedCategory" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value="">{{ t('common.all') }} {{ t('common.category') }}</option>
        <option v-for="cat in categories" :key="cat.id as string" :value="cat.id as string">{{ cat.name }}</option>
      </select>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4">
          <div class="skeleton h-40 w-full rounded-xl mb-3" />
          <div class="skeleton h-5 w-3/4 mb-2" />
          <div class="skeleton h-4 w-1/2" />
        </div>
      </div>
    </template>
    <template v-else-if="products.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink v-for="product in products" :key="product.id as string" :to="`/products/${product.slug}`" class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
          <div class="aspect-square bg-gray-100 overflow-hidden">
            <img v-if="product.image_url" :src="product.image_url as string" :alt="product.name as string" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 line-clamp-1 mb-2">{{ product.description }}</p>
            <p class="text-lg font-bold text-primary-600">{{ formatVND(Number(product.price)) }}</p>
          </div>
        </NuxtLink>
      </div>
    </template>
    <AppEmptyState v-else :description="t('common.noDataDescription')" />
  </div>
</template>
