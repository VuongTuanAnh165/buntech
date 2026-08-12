<script setup lang="ts">
import type { ProductReview } from '~/utils/types'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  review: ProductReview
}>()

const emit = defineEmits<{
  approve: [review: ProductReview, approve: boolean]
  reply: [review: ProductReview]
  delete: [review: ProductReview]
}>()

function ratingStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}

function productImage(review: ProductReview): string | null {
  return review.product?.thumbnailUrl || null
}

function productName(review: ProductReview): string {
  return review.product?.name || 'Sản phẩm không xác định'
}

const authorName = computed(() => {
  return props.review.user?.fullName || 'Khách'
})
</script>

<template>
  <div class="card p-4 transition-shadow hover:shadow-md">
    <div class="flex items-start gap-3">
      <!-- Product thumbnail -->
      <div
        class="bg-surface-muted ring-surface-border h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg ring-1"
      >
        <NuxtImg
          v-if="productImage(props.review)"
          :src="productImage(props.review)!"
          :alt="productName(props.review)"
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
              {{ authorName }}
              <UBadge
                v-if="props.review.hasPurchased"
                color="success"
                variant="subtle"
                size="sm"
                class="ml-2"
                >Đã mua</UBadge
              >
            </p>
            <p class="truncate text-xs text-slate-500 dark:text-zinc-400">
              {{ productName(props.review) }}
            </p>
          </div>
          <div class="flex flex-shrink-0 items-center gap-1">
            <span
              v-for="(filled, i) in ratingStars(props.review.rating)"
              :key="i"
              :class="[
                'i-lucide-star h-4 w-4',
                filled ? 'text-accent-400 fill-accent-400' : 'text-slate-200 dark:text-zinc-600'
              ]"
              aria-hidden="true"
            />
            <span class="ml-1 text-xs font-medium text-slate-500 tabular-nums dark:text-zinc-400"
              >{{ props.review.rating }}/5</span
            >
          </div>
        </div>

        <!-- Content -->
        <p class="mb-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-200">
          {{ props.review.content || 'Không có bình luận' }}
        </p>

        <!-- Reply -->
        <div
          v-if="props.review.replyContent"
          class="bg-surface-muted border-primary-400 mb-3 rounded-lg border-l-2 p-3"
        >
          <div class="mb-1 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <span class="i-lucide-message-circle h-3.5 w-3.5" aria-hidden="true" />
              <span class="font-medium"
                >Phản hồi từ {{ props.review.replier?.fullName || 'BunTech' }}:</span
              >
            </div>
          </div>
          <p class="text-sm text-slate-700 dark:text-zinc-200">{{ props.review.replyContent }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <UBadge :color="props.review.isApproved ? 'success' : 'warning'" variant="subtle">
            <template #leading><span class="h-1.5 w-1.5 rounded-full bg-current" /></template>
            {{ props.review.isApproved ? 'Đã duyệt' : 'Chờ duyệt' }}
          </UBadge>

          <span
            class="flex items-center gap-1 text-xs text-slate-400 tabular-nums dark:text-zinc-500"
          >
            <span class="i-lucide-clock h-3 w-3" aria-hidden="true" />
            {{ formatDate(props.review.createdAt) }}
          </span>

          <div class="ml-auto flex items-center gap-1">
            <UButton
              v-if="!props.review.isApproved"
              variant="ghost"
              color="neutral"
              class="text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
              @click="emit('approve', props.review, true)"
            >
              <span class="i-lucide-check h-3.5 w-3.5" aria-hidden="true" /> Duyệt
            </UButton>
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              class="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
              @click="emit('approve', props.review, false)"
            >
              <span class="i-lucide-x h-3.5 w-3.5" aria-hidden="true" /> Bỏ duyệt
            </UButton>

            <UButton
              variant="ghost"
              color="neutral"
              class="text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
              @click="emit('reply', props.review)"
            >
              <span class="i-lucide-message-square-text h-3.5 w-3.5" aria-hidden="true" />
              {{ props.review.replyContent ? 'Sửa phản hồi' : 'Phản hồi' }}
            </UButton>

            <UButton
              variant="ghost"
              color="neutral"
              class="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
              @click="emit('delete', props.review)"
            >
              <span class="i-lucide-trash-2 h-3.5 w-3.5" aria-hidden="true" /> Xóa
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
