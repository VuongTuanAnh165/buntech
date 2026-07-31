<script setup lang="ts">
import { ArrowLeft, Pencil } from 'lucide-vue-next'
import { mockProducts, mockCategories } from '~/core/mockData'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { formatVND } = useFormat()
useHead({ title: `${t('nav.products')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const productId = route.params.id as string
const loading = ref(true)
const error = ref(false)
const product = ref<Record<string, unknown> | null>(null)

async function loadProduct() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const raw = mockProducts.value.find(p => p.id === productId)
    if (!raw) {
      error.value = true
      return
    }
    product.value = {
      ...raw,
      category: mockCategories.value.find(c => c.id === raw.category_id) || null
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onMounted(loadProduct)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.products'), to: '/admin/products' }, { label: product?.name as string || '' }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/products')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>

    <AppErrorState v-if="error" @retry="loadProduct" />

    <template v-if="loading">
      <div class="skeleton h-64 w-full rounded-xl" />
    </template>

    <template v-else-if="product">
      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <div class="flex gap-6">
          <div class="w-32 h-32 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img v-if="product.image_url" :src="product.image_url as string" :alt="product.name as string" class="w-full h-full object-cover">
            <svg v-else class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
            <p class="text-sm text-gray-500 mb-3">{{ (product.category as Record<string, unknown>)?.name || '—' }}</p>
            <p class="text-lg font-bold text-primary-600 mb-2">{{ formatVND(Number(product.price)) }} / {{ product.unit }}</p>
            <p class="text-sm text-gray-600">{{ product.description }}</p>
            <div class="flex items-center gap-3 mt-4">
              <AppBadge :color="Number(product.stock) > 0 ? 'success' : 'danger'">
                {{ Number(product.stock) > 0 ? `${product.stock} ${t('products.inStock')}` : t('products.outOfStock') }}
              </AppBadge>
              <AppBadge :color="(product.status as string) === 'ACTIVE' ? 'success' : 'gray'">
                {{ (product.status as string) === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
              </AppBadge>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
