<script setup lang="ts">
import { customerService } from '~/services/customerService'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'
import { t } from '~/utils/i18n'

const route = useRoute()
const { constants } = useMasterData()
const orderId = route.params.id as string

useSeoMeta({ title: t('wholesale_order_detail_seo', { id: orderId }) })
definePageMeta({ layout: 'default' })

const { data: response, pending: loading } = useAsyncData(`wholesale-order-${orderId}`, () =>
  customerService.getOrder(orderId)
)

const order = computed(() => response.value?.data)

const getPaymentStatusLabel = (status: string | null) => {
  if (!status) return t('wholesale_order_detail_unpaid')
  return status === 'PAID' ? t('wholesale_order_detail_paid') : t('wholesale_order_detail_unpaid')
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <NuxtLink
          to="/wholesale/orders"
          class="hover:text-primary-600 dark:hover:text-primary-400 mb-3 inline-flex items-center text-sm font-medium text-slate-500 dark:text-zinc-400"
        >
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" />
          {{ $t('public_product_btn_back') }}
        </NuxtLink>
        <div class="flex items-center gap-3">
          <h1 class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {{ $t('admin_order_detail_title', { id: orderId }) }}
          </h1>
          <UBadge
            v-if="order"
            :color="getOrderStatusColor(constants)[order.status] as any"
            variant="subtle"
            size="md"
          >
            {{ getOrderStatusLabel(constants)[order.status] }}
          </UBadge>
        </div>
        <p v-if="order" class="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          {{ $t('wholesale_order_detail_date', { date: formatDateTime(order.createdAt) }) }}
        </p>
      </div>
      <div v-if="order" class="flex gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-printer">{{
          $t('wholesale_order_detail_btn_print')
        }}</UButton>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="space-y-6">
      <USkeleton class="h-40 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left Column: Details -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Order Items -->
        <div class="card overflow-hidden p-0">
          <div class="border-surface-border border-b p-4">
            <h2 class="text-surface-foreground font-semibold">
              {{ $t('wholesale_order_detail_items_title') }}
            </h2>
          </div>
          <div class="p-0">
            <table class="w-full text-left text-sm">
              <thead class="bg-surface-muted text-surface-foreground">
                <tr>
                  <th class="p-4 font-medium">{{ $t('nav_products') }}</th>
                  <th class="p-4 font-medium">{{ $t('wholesale_order_detail_col_price') }}</th>
                  <th class="p-4 text-center font-medium">
                    {{ $t('wholesale_order_detail_col_qty') }}
                  </th>
                  <th class="p-4 text-right font-medium">
                    {{ $t('wholesale_order_detail_col_total') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-surface-border divide-y">
                <tr v-for="item in order.items" :key="item.id" class="hover:bg-surface-hover/50">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :src="getImageUrl(item.product?.thumbnailUrl || undefined) || undefined"
                        icon="i-lucide-package"
                        size="md"
                        class="bg-surface-muted"
                      />
                      <span class="font-medium">{{
                        item.product?.name || $t('nav_products')
                      }}</span>
                    </div>
                  </td>
                  <td class="p-4 tabular-nums">{{ formatVND(Number(item.unitPrice)) }}</td>
                  <td class="p-4 text-center tabular-nums">{{ item.quantity }}</td>
                  <td
                    class="text-primary-600 dark:text-primary-400 p-4 text-right font-medium tabular-nums"
                  >
                    {{ formatVND(Number(item.unitPrice) * Number(item.quantity)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Summary Footer -->
          <div
            class="bg-surface-muted border-surface-border flex flex-col gap-2 border-t p-4 sm:items-end"
          >
            <div class="flex w-full justify-between sm:w-64">
              <span class="text-slate-500">{{ $t('wholesale_order_detail_subtotal') }}</span>
              <span class="tabular-nums">{{ formatVND(Number(order.totalAmount)) }}</span>
            </div>
            <div class="flex w-full justify-between sm:w-64">
              <span class="text-slate-500">{{ $t('wholesale_order_detail_shipping') }}</span>
              <span class="tabular-nums">{{ formatVND(0) }}</span>
            </div>
            <div
              class="mt-2 flex w-full justify-between border-t border-slate-200 pt-2 sm:w-64 dark:border-zinc-700"
            >
              <span class="font-semibold">{{ $t('wholesale_order_detail_total') }}</span>
              <span class="text-primary-600 dark:text-primary-400 text-lg font-bold tabular-nums">
                {{ formatVND(Number(order.totalAmount)) }}
              </span>
            </div>
            <div class="flex w-full justify-between sm:w-64">
              <span class="text-slate-500">{{ $t('wholesale_order_detail_paid_amount') }}</span>
              <span class="text-success-600 tabular-nums">{{
                formatVND(Number(order.amountCollected || 0))
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Info Cards -->
      <div class="space-y-6">
        <!-- Delivery Info -->
        <div class="card p-5">
          <h2 class="text-surface-foreground mb-4 font-semibold">
            {{ $t('wholesale_order_detail_info_title') }}
          </h2>
          <div v-if="order.shippingAddress" class="space-y-3 text-sm">
            <div class="flex gap-2">
              <UIcon name="i-lucide-map-pin" class="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
              <p class="text-slate-600 dark:text-zinc-300">
                {{ order.shippingAddress.addressLine }}<br />
                {{ order.shippingAddress.ward ? order.shippingAddress.ward + ', ' : '' }}
                {{ order.shippingAddress.province || '' }}
              </p>
            </div>
            <div class="flex gap-2">
              <UIcon name="i-lucide-phone" class="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
              <p class="text-slate-600 dark:text-zinc-300">
                {{ order.user?.phoneNumber || $t('wholesale_no_phone') }}
              </p>
            </div>
          </div>
          <div v-else class="text-sm text-slate-500 italic">
            {{ $t('wholesale_order_detail_no_address') }}
          </div>

          <div
            v-if="order.note"
            class="bg-warning-50 dark:bg-warning-900/20 mt-4 rounded-lg p-3 text-sm"
          >
            <p class="text-warning-800 dark:text-warning-300 font-medium">
              {{ $t('wholesale_order_detail_note') }}
            </p>
            <p class="text-warning-700 dark:text-warning-400 mt-1">{{ order.note }}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="card p-5">
          <h2 class="text-surface-foreground mb-4 font-semibold">
            {{ $t('wholesale_order_detail_payment_title') }}
          </h2>
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              :class="
                order.paymentStatus === 'PAID'
                  ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                  : 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
              "
            >
              <UIcon
                :name="order.paymentStatus === 'PAID' ? 'i-lucide-check-circle' : 'i-lucide-clock'"
                class="h-5 w-5"
              />
            </div>
            <div>
              <p class="font-medium">{{ getPaymentStatusLabel(order.paymentStatus) }}</p>
              <p class="text-xs text-slate-500">
                {{
                  order.paymentStatus === 'PAID'
                    ? $t('wholesale_order_detail_payment_done')
                    : $t('wholesale_order_detail_payment_pending')
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Driver Info -->
        <div v-if="order.driver" class="card p-5">
          <h2 class="text-surface-foreground mb-4 font-semibold">
            {{ $t('auth_login_title_driver') }}
          </h2>
          <div class="flex items-center gap-3">
            <UAvatar :alt="order.driver.fullName" size="md" />
            <div>
              <p class="font-medium">{{ order.driver.fullName }}</p>
              <p class="text-sm text-slate-500">{{ order.driver.phoneNumber }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <div class="bg-error-50 dark:bg-error-900/20 mb-4 rounded-full p-4">
        <UIcon name="i-lucide-package-x" class="text-error-500 h-8 w-8" />
      </div>
      <h2 class="text-lg font-semibold">{{ $t('admin_order_list_empty_title') }}</h2>
      <p class="mt-2 mb-6 text-slate-500">{{ $t('wholesale_order_detail_err_desc') }}</p>
      <UButton to="/wholesale/orders" icon="i-lucide-arrow-left">{{
        $t('public_product_btn_back')
      }}</UButton>
    </div>
  </div>
</template>
