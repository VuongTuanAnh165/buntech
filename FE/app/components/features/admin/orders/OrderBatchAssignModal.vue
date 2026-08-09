<!--
  Responsibility: Modal for batch assigning orders to a driver
  Dependency: UI components (UModal, USelectMenu)
  Reason: Extracted from admin/orders/index.vue to meet line count limit
-->
<script setup lang="ts">
import type { Profile } from '~/utils/types'

const props = defineProps<{
  selectedCount: number
  drivers: Profile[]
}>()

const emit = defineEmits<{
  (e: 'assign', driverId: string): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const batchDriverId = ref('')
const batchAssigning = ref(false)

function handleAssign() {
  if (!batchDriverId.value || props.selectedCount === 0) return
  batchAssigning.value = true
  // Fake API delay inside the parent, but we can do it here or pass the event
  emit('assign', batchDriverId.value)
  setTimeout(() => {
    batchAssigning.value = false
    isOpen.value = false
    batchDriverId.value = ''
  }, 500)
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Điều phối đơn hàng">
    <template #body>
      <div class="space-y-4">
        <div
          class="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 flex items-center gap-2 rounded-lg border p-3"
        >
          <div class="i-lucide-truck text-primary-600 dark:text-primary-400 h-5 w-5" />
          <p class="text-primary-700 dark:text-primary-300 text-[13px]">
            Đã chọn <strong class="font-bold">{{ selectedCount }}</strong> đơn hàng để điều phối
          </p>
        </div>
        <UFormField label="Chọn tài xế" required>
          <USelectMenu
            v-model="batchDriverId"
            :items="drivers.map((d) => ({ value: d.id, label: d.full_name }))"
            value-key="value"
            label-key="label"
            placeholder="Chọn tài xế giao hàng"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="isOpen = false"> Hủy </UButton>
        <UButton
          :loading="batchAssigning"
          :disabled="!batchDriverId || selectedCount === 0"
          @click="handleAssign"
        >
          Điều phối ngay
        </UButton>
      </div>
    </template>
  </UModal>
</template>
