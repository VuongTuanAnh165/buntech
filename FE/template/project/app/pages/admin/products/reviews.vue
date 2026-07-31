<script setup lang="ts">
import { Check, X, MessageSquare } from 'lucide-vue-next'
import { mockProductReviews, mockProducts, mockUsers } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
useHead({ title: `${t('products.reviews')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const reviews = ref<Record<string, unknown>[]>([])
const filterStatus = ref<'all' | 'pending' | 'approved'>('pending')
const replyTarget = ref<string | null>(null)
const replyText = ref('')

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockProductReviews.value]
    
    if (filterStatus.value === 'pending') data = data.filter(r => !r.is_approved)
    if (filterStatus.value === 'approved') data = data.filter(r => r.is_approved)
    
    data.sort((a,b) => b.created_at.localeCompare(a.created_at))
    
    reviews.value = data.map(r => ({
      ...r,
      product: mockProducts.value.find(p => p.id === r.product_id) || null,
      user: r.user_id ? mockUsers.value.find(u => u.id === r.user_id) : null
    }))
  } finally {
    loading.value = false
  }
}

async function toggleApprove(review: Record<string, unknown>, approve: boolean) {
  const prev = review.is_approved
  review.is_approved = approve
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockProductReviews.value.findIndex(r => r.id === review.id)
    if (index !== -1) {
      mockProductReviews.value[index].is_approved = approve
    }
    toast.success(approve ? t('products.reviewApproved') : t('products.reviewRejected'))
  } catch {
    review.is_approved = prev
    toast.error(t('errors.unexpected'))
  }
}

async function submitReply() {
  if (!replyTarget.value || !replyText.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockProductReviews.value.findIndex(r => r.id === replyTarget.value)
    if (index !== -1) {
      mockProductReviews.value[index].reply = replyText.value
    }
    const r = reviews.value.find(r => r.id === replyTarget.value)
    if (r) r.reply = replyText.value
    toast.success(t('common.save'))
    replyTarget.value = null
    replyText.value = ''
  } catch {
    toast.error(t('errors.saveFailed'))
  }
}

onMounted(loadData)
watch(filterStatus, loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.products'), to: '/admin/products' }, { label: t('products.reviews') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('products.reviews') }}</h1>
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="f in [{ key: 'pending', label: t('products.pending') }, { key: 'approved', label: t('products.approved') }, { key: 'all', label: t('common.all') }]"
          :key="f.key"
          :class="['px-3 py-1.5 rounded-md text-sm font-medium transition-colors', filterStatus === f.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500']"
          @click="filterStatus = f.key as 'all' | 'pending' | 'approved'"
        >{{ f.label }}</button>
      </div>
    </div>

    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div class="skeleton h-5 w-32 mb-2" />
        <div class="skeleton h-4 w-full mb-1" />
        <div class="skeleton h-4 w-2/3" />
      </div>
    </template>
    <template v-else-if="reviews.length">
      <div v-for="review in reviews" :key="review.id as string" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="font-medium text-gray-900">{{ review.author_name || (review.user as Record<string, unknown>)?.full_name || 'Khách' }}</p>
            <p class="text-xs text-gray-400">{{ (review.product as Record<string, unknown>)?.name }}</p>
          </div>
          <div class="flex items-center gap-1">
            <svg v-for="i in 5" :key="i" :class="['w-4 h-4', i <= (review.rating as number) ? 'text-accent-400' : 'text-gray-200']" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-3">{{ review.content }}</p>
        <div v-if="review.reply" class="bg-gray-50 rounded-lg p-3 mb-3">
          <p class="text-xs text-gray-500 mb-1">{{ t('products.reply') }}:</p>
          <p class="text-sm text-gray-700">{{ review.reply }}</p>
        </div>
        <div class="flex items-center gap-2">
          <AppBadge :color="review.is_approved ? 'success' : 'warning'">
            {{ review.is_approved ? t('products.approved') : t('products.pending') }}
          </AppBadge>
          <button class="flex items-center gap-1 px-2 py-1 text-xs text-success-600 hover:bg-success-50 rounded-lg" @click="toggleApprove(review, true)">
            <Check class="w-3.5 h-3.5" /> {{ t('common.approve') }}
          </button>
          <button class="flex items-center gap-1 px-2 py-1 text-xs text-danger-600 hover:bg-danger-50 rounded-lg" @click="toggleApprove(review, false)">
            <X class="w-3.5 h-3.5" /> {{ t('common.reject') }}
          </button>
          <button class="flex items-center gap-1 px-2 py-1 text-xs text-secondary-600 hover:bg-secondary-50 rounded-lg" @click="replyTarget = review.id as string">
            <MessageSquare class="w-3.5 h-3.5" /> {{ t('common.reply') }}
          </button>
        </div>
        <div v-if="replyTarget === review.id" class="mt-3 flex gap-2">
          <input v-model="replyText" :placeholder="t('products.replyPlaceholder')" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @keydown.enter="submitReply">
          <AppButton size="sm" @click="submitReply">{{ t('common.save') }}</AppButton>
        </div>
      </div>
    </template>
    <AppEmptyState v-else />
  </div>
</template>
