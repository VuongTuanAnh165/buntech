<!--
  Responsibility: Modal for batch assigning orders to a driver
  Dependency: UI components (UModal, USelectMenu)
  Reason: Extracted from admin/orders/index.vue to meet line count limit
-->
<script setup lang="ts">
import type { UserDTO } from '~/utils/types'
import type { AdminOrderDTO } from '~/services/adminOrderService'
import BaseCurrencyDisplay from '~/components/base/CurrencyDisplay.vue'

const props = defineProps<{
  selectedOrders: AdminOrderDTO[]
  drivers: UserDTO[]
}>()

const emit = defineEmits<{
  (
    e: 'assign',
    payload: { driverId: number; orders: { orderId: number; routeOrder: number }[] }
  ): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const batchDriverId = ref('')
const batchAssigning = ref(false)

// Local state for sorting
const localOrders = ref<AdminOrderDTO[]>([])

watch(
  () => props.selectedOrders,
  (newVal) => {
    localOrders.value = [...newVal]
  },
  { immediate: true }
)

function moveUp(index: number) {
  if (index > 0) {
    const temp = localOrders.value[index]
    const prev = localOrders.value[index - 1]
    if (temp && prev) {
      localOrders.value[index] = prev
      localOrders.value[index - 1] = temp
    }
  }
}

function moveDown(index: number) {
  if (index < localOrders.value.length - 1) {
    const temp = localOrders.value[index]
    const next = localOrders.value[index + 1]
    if (temp && next) {
      localOrders.value[index] = next
      localOrders.value[index + 1] = temp
    }
  }
}

function handleAssign() {
  if (!batchDriverId.value || localOrders.value.length === 0) return
  batchAssigning.value = true

  const payload = {
    driverId: Number(batchDriverId.value),
    orders: localOrders.value.map((order, index) => ({
      orderId: order.id,
      routeOrder: index + 1
    }))
  }

  emit('assign', payload)
  setTimeout(() => {
    batchAssigning.value = false
    isOpen.value = false
    batchDriverId.value = ''
  }, 500)
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('admin_order_batch_title')"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div
          class="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 flex items-center gap-2 rounded-lg border p-3"
        >
          <UIcon name="i-lucide-truck" class="text-primary-600 dark:text-primary-400 h-5 w-5" />
          <p class="text-primary-700 dark:text-primary-300 text-sm">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="$t('admin_order_batch_selected_desc', { count: localOrders.length })" />
          </p>
        </div>

        <div
          v-if="localOrders.length > 0"
          class="border-surface-border overflow-hidden rounded-lg border"
        >
          <div
            class="bg-surface-elevated border-surface-border text-muted border-b px-3 py-2 text-xs font-semibold"
          >
            {{ $t('admin_order_batch_order') }}
          </div>
          <div class="max-h-60 overflow-y-auto">
            <div
              v-for="(order, index) in localOrders"
              :key="order.id"
              class="border-surface-border hover:bg-surface-elevated flex items-center gap-3 border-b p-3 transition-colors last:border-b-0"
            >
              <div class="flex flex-col gap-1">
                <UButton
                  icon="i-lucide-chevron-up"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :disabled="index === 0"
                  class="p-0.5"
                  @click="moveUp(index)"
                />
                <UButton
                  icon="i-lucide-chevron-down"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :disabled="index === localOrders.length - 1"
                  class="p-0.5"
                  @click="moveDown(index)"
                />
              </div>
              <div
                class="bg-surface-elevated text-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              >
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-foreground text-sm font-semibold">#{{ order.id }}</span>
                  <span class="text-foreground truncate text-sm">{{
                    order.user?.fullName || $t('admin_order_batch_retail')
                  }}</span>
                </div>
                <div class="text-muted truncate text-xs">
                  {{ order.shippingAddress?.addressLine || $t('admin_order_batch_no_address') }}
                </div>
              </div>
              <div class="shrink-0 text-right">
                <BaseCurrencyDisplay
                  :amount="Number(order.totalAmount)"
                  class="text-foreground text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <UFormField :label="$t('admin_order_batch_select_driver')" required>
          <USelectMenu
            v-model="batchDriverId"
            :items="drivers.map((d) => ({ value: d.id, label: d.fullName }))"
            value-key="value"
            label-key="label"
            :placeholder="$t('admin_order_batch_ph_driver')"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="
            () => {
              isOpen = false
            }
          "
        >
          {{ $t('common_cancel') }}
        </UButton>
        <UButton
          :loading="batchAssigning"
          :disabled="!batchDriverId || localOrders.length === 0"
          @click="handleAssign"
        >
          {{ $t('admin_order_batch_btn_assign') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
