<script setup lang="ts">
import { mockInventoryItems } from '~/utils/mockData'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Xuất kho - BunTech Admin' })
const toast = useToast()
// ─── State ────────────────────────────────────────────────
const selectedItemId = ref('')
const quantity = ref<number | undefined>()
const note = ref('')
const submitting = ref(false)
// ─── Computed ─────────────────────────────────────────────
const inventoryOptions = computed(() =>
  mockInventoryItems.map((item) => ({
    label: `${item.name} (${formatNumber(item.quantity)} ${item.unit})`,
    value: item.id
  }))
)
const selectedItem = computed(() => mockInventoryItems.find((i) => i.id === selectedItemId.value))
const exceedsStock = computed(() =>
  selectedItem.value && quantity.value ? quantity.value > selectedItem.value.quantity : false
)
// ─── Handlers ─────────────────────────────────────────────
async function handleSubmit() {
  if (!selectedItemId.value || !quantity.value) {
    toast.add({ title: 'Vui lòng điền đầy đủ thông tin', color: 'warning' })
    return
  }
  if (exceedsStock.value) {
    toast.add({ title: 'Số lượng xuất vượt tồn kho', color: 'error' })
    return
  }
  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  toast.add({
    title: 'Xuất kho thành công',
    description: `Đã xuất ${formatNumber(quantity.value)} ${selectedItem.value?.unit} ${selectedItem.value?.name}`,
    color: 'success'
  })
  submitting.value = false
  selectedItemId.value = ''
  quantity.value = undefined
  note.value = ''
}
</script>
<template>
  <div>
    <BasePageHeader
      title="Xuất kho"
      description="Xuất nguyên liệu từ kho"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Kho', to: '/admin/inventory' },
        { label: 'Xuất kho' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/inventory">
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" /> Quay lại
        </UButton>
      </template>
    </BasePageHeader>
    <div class="animate-fade-in-up max-w-2xl">
      <div class="card p-6 sm:p-8">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-10 w-10 items-center justify-center rounded-lg ring-1"
          >
            <UIcon
              name="i-lucide-arrow-up-from-line"
              class="text-primary-600 dark:text-primary-400 h-5 w-5"
            />
          </div>
          <div>
            <h2 class="text-surface-foreground text-lg font-semibold">Phiếu xuất kho</h2>
            <p class="text-sm text-slate-500 dark:text-zinc-400">
              Ghi nhận xuất nguyên liệu sản xuất
            </p>
          </div>
        </div>
        <div class="space-y-5">
          <UFormField label="Nguyên liệu" required>
            <USelectMenu
              v-model="selectedItemId"
              :items="inventoryOptions"
              value-key="value"
              placeholder="Chọn nguyên liệu..."
              searchable
              class="w-full"
            />
          </UFormField>
          <Transition name="fade">
            <div
              v-if="selectedItem"
              class="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/30 rounded-xl border p-4"
            >
              <div class="flex items-center justify-between">
                <p class="text-surface-foreground text-sm font-medium">Tồn kho hiện tại</p>
                <p class="text-primary-600 dark:text-primary-400 text-lg font-bold tabular-nums">
                  {{ formatNumber(selectedItem.quantity) }} {{ selectedItem.unit }}
                </p>
              </div>
            </div>
          </Transition>
          <UFormField
            label="Số lượng xuất"
            required
            :error="exceedsStock ? 'Vượt quá tồn kho' : undefined"
          >
            <UInput
              v-model="quantity"
              type="number"
              placeholder="Nhập số lượng..."
              icon="i-lucide-package-minus"
            />
          </UFormField>
          <UFormField label="Ghi chú">
            <UTextarea v-model="note" placeholder="VD: Xuất sản xuất theo đơn hàng..." :rows="3" />
          </UFormField>
          <div class="flex items-center gap-3 pt-2">
            <UButton
              color="primary"
              size="lg"
              :loading="submitting"
              :disabled="!selectedItemId || !quantity || exceedsStock"
              class="flex-1 justify-center"
              @click="handleSubmit"
            >
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> Xác nhận xuất kho
            </UButton>
            <UButton variant="outline" color="neutral" size="lg" to="/admin/inventory">
              Hủy
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
