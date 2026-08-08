<script setup lang="ts">
import {
  Check, X, MessageSquare, Star, ThumbsUp, MessageCircle, Clock,
  TrendingUp, MessageSquareText, Send, ChevronRight,
} from 'lucide-vue-next'
import type { ProductReview } from '../../../core/types'
import { mockReviews, mockProducts } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const { formatDate } = useFormat()

useHead({ title: `Đánh giá sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const reviews = ref<ProductReview[]>(mockReviews.map(r => ({ ...r })))
const products = ref([...mockProducts])

const filterStatus = ref<'pending' | 'approved' | 'all'>('pending')
const replyTargetId = ref<string | null>(null)
const replyText = ref('')
const savingReply = ref(false)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── Product lookup ──────────────────────────────────────
function productName(review: ProductReview): string {
  const p = products.value.find(pr => pr.id === review.product_id)
  return p?.name || 'Sản phẩm không xác định'
}

function productImage(review: ProductReview): string | null {
  const p = products.value.find(pr => pr.id === review.product_id)
  return p?.image_url || null
}

// ─── Filtered reviews ────────────────────────────────────
const filteredReviews = computed(() => {
  switch (filterStatus.value) {
    case 'pending': return reviews.value.filter(r => !r.is_approved)
    case 'approved': return reviews.value.filter(r => r.is_approved)
    default: return reviews.value
  }
})

// ─── Stats ───────────────────────────────────────────────
const totalReviews = computed(() => reviews.value.length)
const pendingCount = computed(() => reviews.value.filter(r => !r.is_approved).length)
const approvedCount = computed(() => reviews.value.filter(r => r.is_approved).length)
const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.value.length) * 10) / 10
})

const stats = computed(() => [
  {
    label: 'Tổng đánh giá',
    value: totalReviews.value,
    icon: MessageSquare,
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
  },
  {
    label: 'Điểm trung bình',
    value: `${averageRating.value}★`,
    icon: Star,
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-100 dark:ring-accent-900/30',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
  },
  {
    label: 'Chờ duyệt',
    value: pendingCount.value,
    icon: Clock,
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-100 dark:ring-warning-900/30',
    accent: 'bg-gradient-to-r from-warning-500 to-warning-400',
  },
])

const filters = computed(() => [
  { key: 'pending' as const, label: 'Chờ duyệt', count: pendingCount.value },
  { key: 'approved' as const, label: 'Đã duyệt', count: approvedCount.value },
  { key: 'all' as const, label: 'Tất cả', count: totalReviews.value },
])

// ─── Actions ────────────────────────────────────────────
function toggleApprove(review: ProductReview, approve: boolean) {
  review.is_approved = approve
  toast.success(approve ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá')
}

function startReply(review: ProductReview) {
  replyTargetId.value = review.id
  replyText.value = review.reply || ''
}

function cancelReply() {
  replyTargetId.value = null
  replyText.value = ''
}

function submitReply() {
  if (!replyTargetId.value || !replyText.value.trim()) return
  savingReply.value = true
  setTimeout(() => {
    const r = reviews.value.find(r => r.id === replyTargetId.value)
    if (r) r.reply = replyText.value.trim()
    toast.success('Đã lưu phản hồi')
    replyTargetId.value = null
    replyText.value = ''
    savingReply.value = false
  }, 300)
}

function ratingStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}
</script>

<template>
  <div>
    <AppPageHeader title="Đánh giá sản phẩm" subtitle="Duyệt và phản hồi đánh giá từ khách hàng" breadcrumb-label="Đánh giá" />

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
            <div class="flex-1"><AppSkeleton height="h-3" width="w-16" /></div>
          </div>
          <AppSkeleton height="h-6" width="w-1/2" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="card card-hover p-5 stagger-item relative overflow-hidden group"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <div :class="['kpi-accent', stat.accent]" />
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', stat.bg, stat.ring]">
              <component :is="stat.icon" :class="['w-5 h-5', stat.text]" aria-hidden="true" />
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-1 bg-surface-hover rounded-lg p-1 w-fit mb-4 animate-fade-in-up">
      <button
        v-for="f in filters"
        :key="f.key"
        :class="[
          'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all min-h-[36px]',
          filterStatus === f.key
            ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-slate-500 dark:text-zinc-400 hover:text-surface-foreground',
        ]"
        @click="filterStatus = f.key"
      >
        {{ f.label }}
        <span
          :class="[
            'tabular-nums text-[11px] px-1.5 py-0.5 rounded-full',
            filterStatus === f.key
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
              : 'bg-surface-border/40 text-slate-500 dark:text-zinc-400',
          ]"
        >{{ f.count }}</span>
      </button>
    </div>

    <!-- Reviews List -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="card p-4 mb-3 animate-fade-in-up" :style="{ animationDelay: `${i * 50}ms` }">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <AppSkeleton height="h-10" width="w-10" class="rounded-full" />
            <div class="space-y-2">
              <AppSkeleton height="h-4" width="w-32" />
              <AppSkeleton height="h-3" width="w-24" />
            </div>
          </div>
          <AppSkeleton height="h-4" width="w-24" />
        </div>
        <div class="skeleton h-4 w-full mb-1" />
        <div class="skeleton h-4 w-2/3" />
      </div>
    </template>

    <template v-else-if="filteredReviews.length">
      <TransitionGroup name="fade" tag="div" class="space-y-3">
        <div
          v-for="(review, idx) in filteredReviews"
          :key="review.id"
          class="card p-4 stagger-item"
          :style="{ animationDelay: `${idx * 30}ms` }"
        >
          <div class="flex items-start gap-3">
            <!-- Product thumbnail -->
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-surface-muted ring-1 ring-surface-border flex-shrink-0">
              <img
                v-if="productImage(review)"
                :src="productImage(review) || ''"
                :alt="productName(review)"
                class="w-full h-full object-cover"
                loading="lazy"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <MessageSquare class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <!-- Header row -->
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="min-w-0">
                  <p class="font-medium text-surface-foreground truncate">{{ review.author_name || 'Khách' }}</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ productName(review) }}</p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <svg
                    v-for="(filled, i) in ratingStars(review.rating)"
                    :key="i"
                    :class="['w-4 h-4', filled ? 'text-accent-400' : 'text-slate-200 dark:text-zinc-600']"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums ml-1">{{ review.rating }}/5</span>
                </div>
              </div>

              <!-- Content -->
              <p class="text-sm text-slate-700 dark:text-zinc-200 mb-3 leading-relaxed">{{ review.content }}</p>

              <!-- Reply (if exists) -->
              <div v-if="review.reply && replyTargetId !== review.id" class="bg-surface-muted rounded-lg p-3 mb-3 border-l-2 border-primary-400">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                  <MessageCircle class="w-3.5 h-3.5" aria-hidden="true" />
                  <span class="font-medium">Phản hồi từ BunTech:</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-zinc-200">{{ review.reply }}</p>
              </div>

              <!-- Reply input -->
              <Transition name="fade">
                <div v-if="replyTargetId === review.id" class="mt-3 mb-3">
                  <div class="flex gap-2">
                    <input
                      v-model="replyText"
                      type="text"
                      placeholder="Nhập phản hồi cho khách hàng..."
                      class="form-input flex-1"
                      @keydown.enter="submitReply"
                      @keydown.esc="cancelReply"
                    >
                    <AppButton size="sm" :loading="savingReply" @click="submitReply">
                      <Send class="w-3.5 h-3.5" aria-hidden="true" /> Gửi
                    </AppButton>
                    <AppButton size="sm" variant="ghost" @click="cancelReply">Hủy</AppButton>
                  </div>
                </div>
              </Transition>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-wrap pt-1">
                <AppBadge :color="review.is_approved ? 'success' : 'warning'" :dot="true">
                  {{ review.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
                </AppBadge>
                <span class="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1 tabular-nums">
                  <Clock class="w-3 h-3" aria-hidden="true" /> {{ formatDate(review.created_at) }}
                </span>

                <div class="flex items-center gap-1 ml-auto">
                  <button
                    v-if="!review.is_approved"
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="toggleApprove(review, true)"
                  >
                    <Check class="w-3.5 h-3.5" aria-hidden="true" /> Duyệt
                  </button>
                  <button
                    v-else
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="toggleApprove(review, false)"
                  >
                    <X class="w-3.5 h-3.5" aria-hidden="true" /> Bỏ duyệt
                  </button>
                  <button
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="startReply(review)"
                  >
                    <MessageSquareText class="w-3.5 h-3.5" aria-hidden="true" /> {{ review.reply ? 'Sửa phản hồi' : 'Phản hồi' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </template>

    <AppEmptyState
      v-else
      :title="filterStatus === 'pending' ? 'Không có đánh giá chờ duyệt' : 'Chưa có đánh giá nào'"
      :description="filterStatus === 'pending' ? 'Tất cả đánh giá đã được duyệt.' : 'Đánh giá từ khách hàng sẽ hiển thị tại đây.'"
    />
  </div>
</template>
