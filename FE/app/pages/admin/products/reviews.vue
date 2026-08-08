<script setup lang="ts">
import type { ProductReview } from '~/utils/types'
import { mockProductReviews as mockReviews, mockProducts } from '~/utils/mockData'

const toast = useToast()
const { formatDate } = useFormat()

useSeoMeta({ title: `Đánh giá sản phẩm - BunTech Admin` })
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
    title: 'Tổng đánh giá',
    value: totalReviews.value,
    icon: 'i-lucide-message-square',
    color: 'primary' as const,
  },
  {
    title: 'Điểm trung bình',
    value: `${averageRating.value}★`,
    icon: 'i-lucide-star',
    color: 'info' as const,
  },
  {
    title: 'Chờ duyệt',
    value: pendingCount.value,
    icon: 'i-lucide-clock',
    color: 'warning' as const,
  },
])

const filters = computed(() => [
  { accessorKey: 'pending' as const, header: 'Chờ duyệt', count: pendingCount.value },
  { accessorKey: 'approved' as const, header: 'Đã duyệt', count: approvedCount.value },
  { accessorKey: 'all' as const, header: 'Tất cả', count: totalReviews.value },
])

// ─── Actions ────────────────────────────────────────────
async function toggleApprove(review: ProductReview, approve: boolean) {
  const original = review.is_approved
  review.is_approved = approve
  
  try {
    // Fake API call
    await new Promise(r => setTimeout(r, 200))
    toast.add({ title: approve ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá', color: 'success' })
  } catch {
    review.is_approved = original
    toast.add({ title: 'Lỗi khi cập nhật trạng thái', color: 'error' })
  }
}

function startReply(review: ProductReview) {
  replyTargetId.value = review.id
  replyText.value = review.reply || ''
}

function cancelReply() {
  replyTargetId.value = null
  replyText.value = ''
}

async function submitReply() {
  if (!replyTargetId.value || !replyText.value.trim()) return
  
  const targetId = replyTargetId.value
  const newReply = replyText.value.trim()
  const r = reviews.value.find(r => r.id === targetId)
  if (!r) return
  
  const originalReply = r.reply
  
  // Optimistic UI update
  r.reply = newReply
  replyTargetId.value = null
  replyText.value = ''
  
  try {
    // Fake API call
    await new Promise(res => setTimeout(res, 300))
    toast.add({ title: 'Đã lưu phản hồi', color: 'success' })
  } catch {
    r.reply = originalReply
    toast.add({ title: 'Lỗi khi lưu phản hồi', color: 'error' })
  }
}

function ratingStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}
</script>

<template>
  <div>
    <BasePageHeader title="Đánh giá sản phẩm" description="Duyệt và phản hồi đánh giá từ khách hàng" />

    <!-- Stats -->
    <div class="mb-6">
      <BaseStatsGrid :stats="stats" :columns="3" :loading="loading" />
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
            <div class="skeleton h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <div class="skeleton h-4 w-32" />
              <div class="skeleton h-3 w-24" />
            </div>
          </div>
          <div class="skeleton h-4 w-24" />
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
              <NuxtImg
                v-if="productImage(review)"
                :src="productImage(review) || ''"
                :alt="productName(review)"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="i-lucide-message-square w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
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
                  <span
                    v-for="(filled, i) in ratingStars(review.rating)"
                    :key="i"
                    :class="['i-lucide-star w-4 h-4', filled ? 'text-accent-400 fill-accent-400' : 'text-slate-200 dark:text-zinc-600']"
                    aria-hidden="true"
                  />
                  <span class="text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums ml-1">{{ review.rating }}/5</span>
                </div>
              </div>

              <!-- Content -->
              <p class="text-sm text-slate-700 dark:text-zinc-200 mb-3 leading-relaxed">{{ review.content }}</p>

              <!-- Reply (if exists) -->
              <div v-if="review.reply && replyTargetId !== review.id" class="bg-surface-muted rounded-lg p-3 mb-3 border-l-2 border-primary-400">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                  <span class="i-lucide-message-circle w-3.5 h-3.5" aria-hidden="true" />
                  <span class="font-medium">Phản hồi từ BunTech:</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-zinc-200">{{ review.reply }}</p>
              </div>

              <!-- Inline reply input removed, using Modal instead -->

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-wrap pt-1">
                <UBadge :color="review.is_approved ? 'success' : 'warning'" variant="subtle">
                  <template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>
                  {{ review.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
                </UBadge>
                <span class="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1 tabular-nums">
                  <span class="i-lucide-clock w-3 h-3" aria-hidden="true" /> {{ formatDate(review.created_at) }}
                </span>

                <div class="flex items-center gap-1 ml-auto">
                  <button
                    v-if="!review.is_approved"
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="toggleApprove(review, true)"
                  >
                    <span class="i-lucide-check w-3.5 h-3.5" aria-hidden="true" /> Duyệt
                  </button>
                  <button
                    v-else
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="toggleApprove(review, false)"
                  >
                    <span class="i-lucide-x w-3.5 h-3.5" aria-hidden="true" /> Bỏ duyệt
                  </button>
                  <button
                    class="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg min-h-[36px] transition-colors"
                    @click="startReply(review)"
                  >
                    <span class="i-lucide-message-square-text w-3.5 h-3.5" aria-hidden="true" /> {{ review.reply ? 'Sửa phản hồi' : 'Phản hồi' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </template>

    <BaseEmptyState
      v-else
      :title="filterStatus === 'pending' ? 'Không có đánh giá chờ duyệt' : 'Chưa có đánh giá nào'"
      :description="filterStatus === 'pending' ? 'Tất cả đánh giá đã được duyệt.' : 'Đánh giá từ khách hàng sẽ hiển thị tại đây.'"
      icon="i-lucide-message-square"
    />

    <!-- Reply Modal -->
    <UModal :open="!!replyTargetId" @update:open="!$event && cancelReply()" title="Phản hồi đánh giá">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Nội dung phản hồi">
            <UTextarea
              v-model="replyText"
              placeholder="Nhập phản hồi cho khách hàng..."
              autofocus
              :rows="4"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton color="neutral" variant="ghost" @click="cancelReply">Hủy</UButton>
          <UButton :loading="savingReply" @click="submitReply" color="primary" icon="i-lucide-send">Gửi phản hồi</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
