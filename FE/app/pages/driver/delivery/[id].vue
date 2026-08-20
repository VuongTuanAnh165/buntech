<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useDriverRoutes } from '~/composables/driver/useDriverRoutes'
import { useDriverDeliver } from '~/composables/driver/useDriverDeliver'
import { useIdempotencyKey } from '~/composables/useIdempotencyKey'
import type { DriverRouteDTO } from '~/services/driverService'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()
const { driverRoutes, refresh: refreshRoutes } = useDriverRoutes()
const { deliverOrder, isSubmitting } = useDriverDeliver()
const { generate: generateIdempotencyKey } = useIdempotencyKey()

definePageMeta({ layout: 'driver' })

const _router = useRouter()
const route = useRoute()
const toast = useToast()
const orderId = computed(() => Number(route.params.id))
const loading = ref(true)
const delivered = ref(false)
const showCollectModal = ref(false)
const amountInput = ref('')

const order = computed(
  () => driverRoutes.value.find((o: DriverRouteDTO) => o.id === orderId.value) || null
)
useSeoMeta({ title: t('driver_delivery_detail_seo') })

const orderItems = computed(() => order.value?.items || [])
const remaining = computed(() => {
  if (!order.value) return 0
  return Math.max(
    0,
    (Number(order.value.totalAmount) || 0) - (Number(order.value.amountCollected) || 0)
  )
})

const statusGradient = computed(() => {
  if (!order.value) return 'from-slate-700 to-slate-800'
  const s = order.value.status
  if (s === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING)
    return 'from-primary-600 to-indigo-700'
  if (s === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED)
    return 'from-success-600 to-emerald-700'
  if (s === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED)
    return 'from-error-600 to-rose-700'
  if (s === constants.value?.[ConstantKey.OrderStatus]?.PROCESSING)
    return 'from-warning-500 to-amber-600'
  return 'from-slate-700 to-slate-800'
})

const statusLabel = computed<Record<string, string>>(() => ({
  DELIVERING: t('status_order_delivering'),
  PROCESSING: t('status_order_processing'),
  PENDING: t('driver_deliv_status_pending'),
  DELIVERED: t('status_order_delivered'),
  CANCELLED: t('status_order_cancelled')
}))

function callCustomer() {
  const phone = order.value?.user?.phoneNumber || order.value?.shippingAddress?.phoneNumber
  if (phone) {
    toast.add({ title: t('driver_delivery_detail_call_success', { phone }), color: 'success' })
  } else {
    toast.add({ title: t('driver_delivery_detail_call_err'), color: 'error' })
  }
}

function navigateToAddress() {
  toast.add({ title: t('driver_delivery_detail_map_msg'), color: 'success' })
}

function openCollectModal() {
  showCollectModal.value = true
}

async function confirmDelivery() {
  if (isSubmitting.value || !order.value) return

  const payload = {
    amountCollected: Number(amountInput.value) || 0,
    idempotencyKey: generateIdempotencyKey(),
    updatedAt: order.value.updatedAt
  }

  const success = await deliverOrder(order.value.id, payload)
  if (success) {
    delivered.value = true
    showCollectModal.value = false

    // Optimistic update cache
    const targetOrder = driverRoutes.value.find((o: DriverRouteDTO) => o.id === order.value!.id)
    if (targetOrder) {
      targetOrder.status = constants.value?.[ConstantKey.OrderStatus]?.DELIVERED || 'DELIVERED'
    }

    try {
      await refreshRoutes()
    } catch {
      // Ignore network error if offline
    }

    setTimeout(() => navigateTo('/driver/delivery'), 2000)
  }
}

onMounted(() => {
  setTimeout(() => {
    if (order.value) {
      amountInput.value = String(remaining.value)
    }
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="p-4 pb-6">
    <!-- Back button -->
    <UButton
      variant="ghost"
      color="neutral"
      class="mb-4 flex min-h-[44px] items-center gap-1 rounded-md px-2 text-sm text-slate-500 transition-colors hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white"
      @click="
        () => {
          navigateTo('/driver/delivery')
        }
      "
    >
      <UIcon name="i-lucide-arrow-left" class="h-4 w-4" /> {{ $t('admin_blog_cat_btn_back') }}
    </UButton>

    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton mb-4 h-48 w-full rounded-2xl" />
      <div class="skeleton mb-4 h-32 w-full rounded-xl" />
      <div class="skeleton mb-4 h-40 w-full rounded-xl" />
      <div class="skeleton h-24 w-full rounded-xl" />
    </template>

    <!-- Order not found -->
    <BaseEmptyState
      v-else-if="!order"
      :title="$t('admin_order_list_empty_title')"
      :description="$t('driver_delivery_detail_err_desc')"
    />

    <!-- Delivered success state -->
    <template v-else-if="delivered">
      <div class="card p-12 text-center">
        <div
          class="bg-success-100 dark:bg-success-900/30 animate-scale-in mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
        >
          <UIcon
            name="i-lucide-check-circle-2"
            class="text-success-600 dark:text-success-400 h-10 w-10"
          />
        </div>
        <h2 class="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
          {{ $t('driver_delivery_detail_success_title') }}
        </h2>
        <p class="mb-4 text-sm text-slate-500 dark:text-zinc-400">
          {{ $t('driver_delivery_detail_success_desc', { id: order.id }) }}
        </p>
        <p class="text-sm text-slate-400 dark:text-zinc-500">
          {{ $t('driver_delivery_detail_success_redirect') }}
        </p>
      </div>
    </template>

    <!-- Order detail -->
    <template v-else>
      <!-- Status hero card -->
      <div
        :class="[
          'relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white',
          statusGradient
        ]"
      >
        <div class="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div class="relative">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <p class="font-mono text-xs text-white/70">#{{ order.id }}</p>
              <h2 class="mt-0.5 text-xl font-bold">
                {{ statusLabel[order.status] || order.status }}
              </h2>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
            >
              <UIcon name="i-lucide-package" class="h-6 w-6 text-white" />
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-white/90">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-clock" class="h-4 w-4" />
              <span>{{ formatDateTime(order.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-truck" class="h-4 w-4" />
              <span>{{ $t('admin_dash_n_products', { count: orderItems.length }) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer info card -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-user" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_delivery_detail_customer_title') }}
        </h2>
        <div class="mb-4 flex items-center gap-3">
          <UAvatar :alt="order.user?.fullName || $t('driver_history_guest')" size="md" />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-neutral-900 dark:text-white">
              {{
                order.user?.fullName ||
                order.shippingAddress?.recipientName ||
                $t('driver_history_guest')
              }}
            </p>
            <p class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">
              {{
                order.user?.phoneNumber ||
                order.shippingAddress?.phoneNumber ||
                $t('wholesale_no_phone')
              }}
            </p>
          </div>
          <UButton
            variant="ghost"
            color="neutral"
            class="bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 flex h-10 min-h-[44px] w-10 min-w-[44px] items-center justify-center rounded-xl transition-colors"
            @click="callCustomer"
          >
            <UIcon name="i-lucide-phone" class="text-success-600 dark:text-success-400 h-5 w-5" />
          </UButton>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <UIcon name="i-lucide-star" class="fill-warning-400 text-warning-400 h-3.5 w-3.5" />
          <span class="text-warning-600 dark:text-warning-400 font-medium">4.8</span>
          <span class="text-slate-300 dark:text-zinc-600">·</span>
          <span>{{ $t('driver_delivery_detail_customer_loyal') }}</span>
        </div>
      </div>

      <!-- Delivery address card -->
      <div class="card mb-4 p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
            {{ $t('admin_order_create_address') }}
          </h2>
          <UButton
            variant="ghost"
            color="neutral"
            class="text-primary-600 dark:text-primary-400 flex items-center gap-1 text-xs font-medium hover:underline"
            @click="navigateToAddress"
          >
            <UIcon name="i-lucide-navigation" class="h-3.5 w-3.5" />
            {{ $t('driver_delivery_detail_address_btn') }}
          </UButton>
        </div>
        <div class="flex items-start gap-3">
          <div
            class="bg-error-50 dark:bg-error-900/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          >
            <UIcon name="i-lucide-map-pin" class="text-error-600 dark:text-error-400 h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm leading-relaxed font-medium text-neutral-900 dark:text-white">
              {{ order.shippingAddress?.addressLine || '' }}
              {{
                [order.shippingAddress?.ward, order.shippingAddress?.province]
                  .filter(Boolean)
                  .join(', ')
              }}
            </p>
            <p
              v-if="order.note"
              class="text-warning-600 dark:text-warning-400 mt-2 flex items-center gap-1 text-xs"
            >
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
              {{ order.note }}
            </p>
          </div>
        </div>
      </div>

      <!-- Order items list -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-package" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_delivery_detail_items_title') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-zinc-800/50"
          >
            <div
              class="bg-primary-50 dark:bg-primary-900/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
            >
              <UIcon
                name="i-lucide-package"
                class="text-primary-600 dark:text-primary-400 h-5 w-5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ item.product?.name || $t('nav_products') }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">x{{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment summary -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-wallet" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('wholesale_qa_payment') }}
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">{{
              $t('driver_delivery_detail_payment_total')
            }}</span>
            <span class="font-semibold text-neutral-900 tabular-nums dark:text-white">{{
              formatVND(Number(order.totalAmount) || 0)
            }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">{{
              $t('driver_history_stat_collected')
            }}</span>
            <span class="text-success-600 dark:text-success-400 font-semibold tabular-nums">{{
              formatVND(Number(order.amountCollected) || 0)
            }}</span>
          </div>
          <div
            class="flex items-center justify-between border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800"
          >
            <span class="font-medium text-neutral-900 dark:text-white">{{
              $t('driver_delivery_detail_payment_remain')
            }}</span>
            <span class="text-error-600 dark:text-error-400 text-lg font-bold tabular-nums">{{
              formatVND(remaining)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-1 gap-3 pb-4">
        <UButton v-if="remaining > 0" variant="outline" size="lg" block @click="openCollectModal">
          <UIcon name="i-lucide-wallet" class="mr-1 h-4 w-4" />
          {{ $t('driver_delivery_detail_btn_collect') }}
        </UButton>
        <BaseSwipeToConfirm
          :loading="isSubmitting"
          :text="$t('driver_delivery_detail_swipe_deliver')"
          @confirmed="confirmDelivery"
        />
      </div>
    </template>

    <!-- Collect amount modal -->
    <UModal v-model:open="showCollectModal">
      <template #content>
        <div class="space-y-4 p-6">
          <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ $t('driver_delivery_detail_modal_title') }}
          </h3>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500 dark:text-zinc-400">{{
              $t('driver_delivery_detail_modal_label1')
            }}</label>
            <p class="text-primary-600 dark:text-primary-400 mb-3 text-2xl font-bold tabular-nums">
              {{ formatVND(remaining) }}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-500 dark:text-zinc-400">{{
              $t('driver_delivery_detail_modal_label2')
            }}</label>
            <UInput
              v-model="amountInput"
              type="text"
              inputmode="numeric"
              :placeholder="$t('driver_delivery_detail_modal_ph')"
              size="lg"
            />
          </div>
          <div
            class="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-zinc-800/50"
          >
            <span class="text-sm text-slate-500 dark:text-zinc-400">{{
              $t('driver_delivery_detail_modal_change')
            }}</span>
            <span class="font-semibold text-neutral-900 tabular-nums dark:text-white">{{
              formatVND(Math.max(0, Number(amountInput) - remaining))
            }}</span>
          </div>
          <BaseSwipeToConfirm
            :loading="isSubmitting"
            :text="$t('driver_delivery_detail_swipe_confirm')"
            @confirmed="confirmDelivery"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
