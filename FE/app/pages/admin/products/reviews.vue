<script setup lang="ts">
import type { ProductReview } from '~/utils/types'
import { mockProductReviews as mockReviews, mockProducts } from '~/utils/mockData'
const toast = useToast()
useSeoMeta({ title: `Đánh giá sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })
// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const reviews = ref<ProductReview[]>(mockReviews.map((r) => ({ ...r })))
const products = ref([...mockProducts])
const filterStatus = ref<'pending' | 'approved' | 'all'>('pending')
const replyTargetId = ref<string | null>(null)
const replyText = ref('')
const savingReply = ref(false)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
// ─── Product lookup ──────────────────────────────────────
function productName(review: ProductReview): string {
  const p = products.value.find((pr) => pr.id === review.product_id)
  return p?.name || 'Sản phẩm không xác định'
}
function productImage(review: ProductReview): string | null {
  const p = products.value.find((pr) => pr.id === review.product_id)
  return p?.image_url || null
}
// ─── Filtered reviews ────────────────────────────────────
const filteredReviews = computed(() => {
  switch (filterStatus.value) {
    case 'pending':
      return reviews.value.filter((r) => !r.is_approved)
    case 'approved':
      return reviews.value.filter((r) => r.is_approved)
    default:
      return reviews.value
  }
})
// ─── Stats ───────────────────────────────────────────────
const totalReviews = computed(() => reviews.value.length)
const pendingCount = computed(() => reviews.value.filter((r) => !r.is_approved).length)
const approvedCount = computed(() => reviews.value.filter((r) => r.is_approved).length)
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
    color: 'primary' as const
  },
  {
    title: 'Điểm trung bình',
    value: `${averageRating.value}★`,
    icon: 'i-lucide-star',
    color: 'info' as const
  },
  {
    title: 'Chờ duyệt',
    value: pendingCount.value,
    icon: 'i-lucide-clock',
    color: 'warning' as const
  }
])
const filters = computed(() => [
  { accessorKey: 'pending' as const, header: 'Chờ duyệt', count: pendingCount.value },
  { accessorKey: 'approved' as const, header: 'Đã duyệt', count: approvedCount.value },
  { accessorKey: 'all' as const, header: 'Tất cả', count: totalReviews.value }
])
// ─── Actions ────────────────────────────────────────────
async function toggleApprove(review: ProductReview, approve: boolean) {
  const original = review.is_approved
  review.is_approved = approve

  try {
    // Fake API call
    await new Promise((r) => setTimeout(r, 200))
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
  const r = reviews.value.find((r) => r.id === targetId)
  if (!r) return

  const originalReply = r.reply

  // Optimistic UI update
  r.reply = newReply
  replyTargetId.value = null
  replyText.value = ''

  try {
    // Fake API call
    await new Promise((res) => setTimeout(res, 300))
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
    <BasePageHeader
      title="Đánh giá sản phẩm"
      description="Duyệt và phản hồi đánh giá từ khách hàng"
    />
    <!-- Stats -->
    <div class="mb-6">
      <BaseStatsGrid :stats="stats" :columns="3" :loading="loading" />
    </div>
    <!-- Filter Tabs -->
    <div
      class="bg-surface-hover animate-fade-in-up mb-4 flex w-fit items-center gap-1 rounded-lg p-1"
    >
      <UButton
        v-for="f in filters"
        :key="f.accessorKey"
        variant="ghost"
        color="neutral"
        :class="[
          'inline-flex min-h-[36px] items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
          filterStatus === f.accessorKey
            ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
            : 'hover:text-surface-foreground text-slate-500 dark:text-zinc-400'
        ]"
        @click="
          () => {
            filterStatus = f.accessorKey as 'pending' | 'approved' | 'all'
          }
        "
      >
        {{ f.header }}
        <span
          :class="[
            'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
            filterStatus === f.accessorKey
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
              : 'bg-surface-border/40 text-slate-500 dark:text-zinc-400'
          ]"
          >{{ f.count }}</span
        >
      </UButton>
    </div>
    <!-- Reviews List -->
    <template v-if="loading">
      <div
        v-for="i in 5"
        :key="i"
        class="card animate-fade-in-up mb-3 p-4"
        :style="{ animationDelay: `${i * 50}ms` }"
      >
        <div class="mb-3 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="skeleton h-10 w-10 rounded-full" />
            <div class="space-y-2">
              <div class="skeleton h-4 w-32" />
              <div class="skeleton h-3 w-24" />
            </div>
          </div>
          <div class="skeleton h-4 w-24" />
        </div>
        <div class="skeleton mb-1 h-4 w-full" />
        <div class="skeleton h-4 w-2/3" />
      </div>
    </template>
    <template v-else-if="filteredReviews.length">
      <TransitionGroup name="fade" tag="div" class="space-y-3">
        <div
          v-for="(review, idx) in filteredReviews"
          :key="review.id"
          class="card stagger-item p-4"
          :style="{ animationDelay: `${idx * 30}ms` }"
        >
          <div class="flex items-start gap-3">
            <!-- Product thumbnail -->
            <div
              class="bg-surface-muted ring-surface-border h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg ring-1"
            >
              <NuxtImg
                v-if="productImage(review)"
                :src="productImage(review) || ''"
                :alt="productName(review)"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <span
                  class="i-lucide-message-square h-5 w-5 text-slate-300 dark:text-zinc-600"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <!-- Header row -->
              <div class="mb-2 flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-surface-foreground truncate font-medium">
                    {{ review.author_name || 'Khách' }}
                  </p>
                  <p class="truncate text-xs text-slate-500 dark:text-zinc-400">
                    {{ productName(review) }}
                  </p>
                </div>
                <div class="flex flex-shrink-0 items-center gap-1">
                  <span
                    v-for="(filled, i) in ratingStars(review.rating)"
                    :key="i"
                    :class="[
                      'i-lucide-star h-4 w-4',
                      filled
                        ? 'text-accent-400 fill-accent-400'
                        : 'text-slate-200 dark:text-zinc-600'
                    ]"
                    aria-hidden="true"
                  />
                  <span
                    class="ml-1 text-xs font-medium text-slate-500 tabular-nums dark:text-zinc-400"
                    >{{ review.rating }}/5</span
                  >
                </div>
              </div>
              <!-- Content -->
              <p class="mb-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-200">
                {{ review.content }}
              </p>
              <!-- Reply (if exists) -->
              <div
                v-if="review.reply && replyTargetId !== review.id"
                class="bg-surface-muted border-primary-400 mb-3 rounded-lg border-l-2 p-3"
              >
                <div
                  class="mb-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400"
                >
                  <span class="i-lucide-message-circle h-3.5 w-3.5" aria-hidden="true" />
                  <span class="font-medium">Phản hồi từ BunTech:</span>
                </div>
                <p class="text-sm text-slate-700 dark:text-zinc-200">{{ review.reply }}</p>
              </div>
              <!-- Inline reply input removed, using Modal instead -->
              <!-- Actions -->
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <UBadge :color="review.is_approved ? 'success' : 'warning'" variant="subtle">
                  <template #leading><span class="h-1.5 w-1.5 rounded-full bg-current" /></template>
                  {{ review.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
                </UBadge>
                <span
                  class="flex items-center gap-1 text-xs text-slate-400 tabular-nums dark:text-zinc-500"
                >
                  <span class="i-lucide-clock h-3 w-3" aria-hidden="true" />
                  {{ formatDate(review.created_at) }}
                </span>
                <div class="ml-auto flex items-center gap-1">
                  <UButton
                    v-if="!review.is_approved"
                    variant="ghost"
                    color="neutral"
                    class="text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                    @click="toggleApprove(review, true)"
                  >
                    <span class="i-lucide-check h-3.5 w-3.5" aria-hidden="true" /> Duyệt
                  </UButton>
                  <UButton
                    v-else
                    variant="ghost"
                    color="neutral"
                    class="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                    @click="toggleApprove(review, false)"
                  >
                    <span class="i-lucide-x h-3.5 w-3.5" aria-hidden="true" /> Bỏ duyệt
                  </UButton>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    class="text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                    @click="
                      () => {
                        startReply(review)
                      }
                    "
                  >
                    <span class="i-lucide-message-square-text h-3.5 w-3.5" aria-hidden="true" />
                    {{ review.reply ? 'Sửa phản hồi' : 'Phản hồi' }}
                  </UButton>
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
      :description="
        filterStatus === 'pending'
          ? 'Tất cả đánh giá đã được duyệt.'
          : 'Đánh giá từ khách hàng sẽ hiển thị tại đây.'
      "
      icon="i-lucide-message-square"
    />
    <!-- Reply Modal -->
    <UModal
      :open="!!replyTargetId"
      title="Phản hồi đánh giá"
      @update:open="!$event && cancelReply()"
    >
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
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="cancelReply">Hủy</UButton>
          <UButton :loading="savingReply" color="primary" icon="i-lucide-send" @click="submitReply"
            >Gửi phản hồi</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>
