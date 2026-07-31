<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import DOMPurify from 'dompurify'
import { mockProducts, mockCategories, mockProductReviews, generateId } from '~/core/mockData'

const { t } = useI18n()
const nuxt = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()
const { formatVND } = useFormat()
definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)
const product = ref<Record<string, unknown> | null>(null)
const reviews = ref<Record<string, unknown>[]>([])

const showReviewForm = ref(false)
const reviewForm = ref({ rating: 5, content: '' })
const submittingReview = ref(false)

async function loadProduct() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const p = mockProducts.value.find(p => p.slug === slug && !p.deleted_at)
    if (p) {
      const category = mockCategories.value.find(c => c.id === p.category_id)
      product.value = { ...p, category: category ? { name: category.name } : null } as Record<string, unknown>
      useHead({ title: `${product.value.name} - BunTech` })
      loadReviews()
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadReviews() {
  if (!product.value) return
  await new Promise(r => setTimeout(r, 100))
  reviews.value = mockProductReviews.value
    .filter(r => r.product_id === product.value!.id && r.is_approved)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Record<string, unknown>[]
}

async function submitReview() {
  if (!authStore.isAuthenticated) {
    toast.error(t('customer.loginPrompt'))
    return
  }
  if (!reviewForm.value.content) { toast.error(t('common.required')); return }
  submittingReview.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    mockProductReviews.value.push({
      id: generateId(),
      product_id: product.value?.id as string,
      user_id: authStore.user?.id,
      author_name: authStore.user?.full_name || '',
      rating: reviewForm.value.rating,
      content: reviewForm.value.content,
      is_approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    toast.success(t('customer.reviewSuccess'))
    showReviewForm.value = false
    reviewForm.value = { rating: 5, content: '' }
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    submittingReview.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <AppErrorState v-if="error" @retry="loadProduct" />

    <template v-if="loading">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="skeleton aspect-square w-full rounded-2xl" />
        <div class="space-y-4">
          <div class="skeleton h-8 w-3/4" />
          <div class="skeleton h-6 w-1/3" />
          <div class="skeleton h-24 w-full" />
        </div>
      </div>
    </template>

    <template v-else-if="product">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          <img v-if="product.image_url" :src="product.image_url as string" :alt="product.name as string" class="w-full h-full object-cover" loading="lazy">
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>
        <div>
          <p class="text-sm text-primary-600 font-medium mb-2">{{ (product.category as Record<string, unknown>)?.name }}</p>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
          <p class="text-2xl font-bold text-primary-600 mb-4">{{ formatVND(Number(product.price)) }} / {{ product.unit }}</p>
          <p class="text-gray-600 mb-6">{{ product.description }}</p>
          <div class="flex items-center gap-3 mb-6">
            <AppBadge :color="Number(product.stock) > 0 ? 'success' : 'danger'">
              {{ Number(product.stock) > 0 ? t('products.inStock') : t('products.outOfStock') }}
            </AppBadge>
          </div>
          <NuxtLink to="/quick-order">
            <AppButton size="lg">{{ t('customer.addToOrder') }}</AppButton>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ t('products.reviews') }}</h2>
          <AppButton v-if="authStore.isAuthenticated" size="sm" variant="outline" @click="showReviewForm = !showReviewForm">{{ t('customer.writeReview') }}</AppButton>
        </div>

        <div v-if="showReviewForm" class="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <form class="space-y-4" @submit.prevent="submitReview">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('products.rating') }}</label>
              <div class="flex gap-1">
                <button v-for="i in 5" :key="i" @click="reviewForm.rating = i">
                  <Star :class="['w-6 h-6', i <= reviewForm.rating ? 'text-accent-400 fill-current' : 'text-gray-300']" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('products.reviewContent') }}</label>
              <textarea v-model="reviewForm.content" rows="3" class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <AppButton :loading="submittingReview" size="sm">{{ t('customer.submitReview') }}</AppButton>
          </form>
        </div>

        <template v-if="reviews.length">
          <div v-for="review in reviews" :key="review.id as string" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
            <div class="flex items-center justify-between mb-2">
              <p class="font-medium text-gray-900">{{ review.author_name }}</p>
              <div class="flex">
                <Star v-for="i in 5" :key="i" :class="['w-4 h-4', i <= (review.rating as number) ? 'text-accent-400 fill-current' : 'text-gray-300']" />
              </div>
            </div>
            <p class="text-sm text-gray-600">{{ review.content }}</p>
            <div v-if="review.reply" class="mt-3 bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">{{ t('products.reply') }}:</p>
              <p class="text-sm text-gray-700">{{ review.reply }}</p>
            </div>
          </div>
        </template>
        <AppEmptyState v-else :description="t('common.noDataDescription')" />
      </div>
    </template>
  </div>
</template>
