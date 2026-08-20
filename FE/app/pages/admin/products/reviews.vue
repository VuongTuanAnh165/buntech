<script setup lang="ts">
import type { ProductReview } from '~/utils/types'
import { productReviewService } from '~/services/productReviewService'
import { normalizePaginationResponse } from '~/utils/api'
import ProductReviewCard from '~/components/features/admin/products/ProductReviewCard.vue'

import { z } from 'zod'
import { t } from '~/utils/i18n'

const confirmDialog = useConfirmDialog()

useSeoMeta({ title: t('admin_reviews_seo_title') })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const filterStatus = ref<'all' | 'pending' | 'approved'>('all')
const page = ref(1)
const perPage = ref(10)

const replyTargetId = ref<number | null>(null)
const replyState = reactive({ replyText: '' })

const replySchema = z.object({
  replyText: z
    .string()
    .min(1, t('admin_reviews_form_reply_req'))
    .max(2000, t('admin_reviews_form_reply_max'))
})

const { formErrors, formRef, validate: validateForm } = useZodForm(replySchema)

// ─── Data Fetching ──────────────────────────────────────
const { data: statsRes, refresh: refreshStats } = useAsyncData('admin-review-stats', () =>
  productReviewService.getReviewStats()
)

const {
  data: rawRes,
  pending: loading,
  refresh: refreshList
} = useAsyncData(
  'admin-reviews',
  () =>
    productReviewService.getAdminReviews({
      page: page.value,
      limit: perPage.value,
      status: filterStatus.value
    }),
  { watch: [page, perPage, filterStatus] }
)

const normalized = computed(() => normalizePaginationResponse<ProductReview>(rawRes.value))
const reviews = computed(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)
const stats = computed(() => statsRes.value?.data)

// ─── Stats & Filters ────────────────────────────────────
const displayStats = computed(() => [
  {
    title: t('admin_reviews_kpi_total'),
    value: stats.value?.total || 0,
    icon: 'i-lucide-message-square',
    color: 'primary' as const
  },
  {
    title: t('admin_reviews_kpi_avg'),
    value: `${stats.value?.averageRating || 0}★`,
    icon: 'i-lucide-star',
    color: 'info' as const
  },
  {
    title: t('status_user_pending'),
    value: stats.value?.pending || 0,
    icon: 'i-lucide-clock',
    color: 'warning' as const
  }
])

const filterTabs = computed(() => [
  {
    accessorKey: 'pending' as const,
    header: t('status_user_pending'),
    count: stats.value?.pending || 0
  },
  {
    accessorKey: 'approved' as const,
    header: t('admin_reviews_tab_approved'),
    count: stats.value?.approved || 0
  },
  { accessorKey: 'all' as const, header: t('admin_debt_type_all'), count: stats.value?.total || 0 }
])

// ─── Actions ────────────────────────────────────────────
async function toggleApprove(review: ProductReview, approve: boolean) {
  try {
    await productReviewService.approveReview(review.id, approve)
    refreshList()
    refreshStats()
  } catch {
    // API interceptor handles error notification
  }
}

async function deleteReview(review: ProductReview) {
  const isConfirmed = await confirmDialog.confirm({
    title: t('admin_reviews_del_title'),
    description: t('admin_reviews_del_desc'),
    confirmLabel: t('delete'),
    color: 'error'
  })
  if (!isConfirmed) return

  try {
    await productReviewService.deleteReview(review.id)
    refreshList()
    refreshStats()
  } catch {
    // API interceptor handles error notification
  }
}

function startReply(review: ProductReview) {
  replyTargetId.value = review.id
  replyState.replyText = review.replyContent || ''
  formRef.value.clearErrors()
}

function cancelReply() {
  replyTargetId.value = null
  replyState.replyText = ''
  formRef.value.clearErrors()
}

const { handleSubmit, isSubmitting: savingReply } = useFormSubmit()

const submitReplyAction = handleSubmit(
  async (data: { replyText: string }) => {
    if (!replyTargetId.value) return
    await productReviewService.replyReview(replyTargetId.value, data.replyText.trim())
  },
  {
    formRef,
    onSuccess: () => {
      cancelReply()
      refreshList()
    }
  }
)

const handleFormSubmit = async () => {
  if (validateForm(replyState)) {
    await submitReplyAction(replyState)
  }
}
</script>

<template>
  <div>
    <BasePageHeader :title="$t('admin_reviews_title')" :description="$t('admin_reviews_desc')" />

    <!-- Stats -->
    <div class="mb-6">
      <BaseStatsGrid :stats="displayStats" :columns="3" :loading="!statsRes" />
    </div>

    <!-- Filter Tabs -->
    <div
      class="bg-surface-hover animate-fade-in-up mb-4 flex w-fit items-center gap-1 rounded-lg p-1"
    >
      <UButton
        v-for="f in filterTabs"
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
            filterStatus = f.accessorKey
            page = 1
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

    <template v-else-if="reviews.length">
      <TransitionGroup name="fade" tag="div" class="space-y-3">
        <ProductReviewCard
          v-for="(review, idx) in reviews"
          :key="review.id"
          :review="review"
          class="stagger-item"
          :style="{ animationDelay: `${idx * 30}ms` }"
          @approve="toggleApprove"
          @reply="startReply"
          @delete="deleteReview"
        />
      </TransitionGroup>

      <!-- Pagination -->
      <div v-if="meta.lastPage > 1" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-zinc-400">
          {{
            $t('admin_reviews_pagination', {
              from: meta.from || 0,
              to: meta.to || 0,
              total: meta.total
            })
          }}
        </p>
        <UPagination v-model:page="page" :items-per-page="perPage" :total="meta.total" />
      </div>
    </template>

    <BaseEmptyState
      v-else
      :title="
        filterStatus === 'pending'
          ? $t('admin_reviews_empty_pending_title')
          : $t('admin_reviews_empty_title')
      "
      :description="
        filterStatus === 'pending'
          ? $t('admin_reviews_empty_pending_desc')
          : $t('admin_reviews_empty_desc')
      "
      icon="i-lucide-message-square"
    />

    <!-- Reply Modal -->
    <UModal
      :open="!!replyTargetId"
      :title="$t('admin_reviews_modal_reply_title')"
      @update:open="!$event && cancelReply()"
    >
      <template #body>
        <form id="reply-form" class="space-y-4" @submit.prevent="handleFormSubmit">
          <UFormField
            :label="$t('admin_reviews_form_reply')"
            name="replyText"
            :error="formErrors.replyText"
          >
            <UTextarea
              v-model="replyState.replyText"
              :placeholder="$t('admin_reviews_form_reply_placeholder')"
              autofocus
              :rows="4"
              class="w-full"
            />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="cancelReply">{{
            $t('common_cancel')
          }}</UButton>
          <UButton
            type="submit"
            form="reply-form"
            :loading="savingReply"
            color="primary"
            icon="i-lucide-send"
          >
            {{ $t('admin_reviews_btn_send') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
