<script setup lang="ts">
import { mockCustomers } from '~/utils/mockData'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Thu nợ - BunTech Admin' })
const toast = useToast()
// ─── State ────────────────────────────────────────────────
const selectedCustomerId = ref('')
const amount = ref<number | undefined>()
const note = ref('')
const submitting = ref(false)
// ─── Computed ─────────────────────────────────────────────
const debtCustomers = computed(() =>
  mockCustomers.filter(c => c.debt_limit > 0).map(c => ({
    label: `${c.full_name} — ${c.phone}`,
    value: c.id,
    avatar: c.avatar_url,
    debt: c.debt_limit,
  }))
)
const selectedCustomer = computed(() =>
  debtCustomers.value.find(c => c.value === selectedCustomerId.value)
)
// ─── Handlers ─────────────────────────────────────────────
async function handleSubmit() {
  if (!selectedCustomerId.value || !amount.value) {
    toast.add({ title: 'Vui lòng điền đầy đủ thông tin', color: 'warning' })
    return
  }
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  toast.add({ title: 'Thu nợ thành công', description: `Đã ghi nhận ${formatVND(amount.value)} từ khách hàng`, color: 'success' })
  submitting.value = false
  selectedCustomerId.value = ''
  amount.value = undefined
  note.value = ''
}
</script>
<template>
  <div>
    <BasePageHeader
      title="Thu nợ"
      description="Ghi nhận khách trả nợ"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Tài chính', to: '/admin/debt' },
        { label: 'Thu nợ' },
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/debt">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" /> Quay lại
        </UButton>
      </template>
    </BasePageHeader>
    <div class="max-w-2xl animate-fade-in-up">
      <div class="card p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-surface-foreground">Ghi nhận thanh toán</h2>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Chọn khách hàng và nhập số tiền trả nợ</p>
          </div>
        </div>
        <div class="space-y-5">
          <!-- Customer select -->
          <UFormField label="Khách hàng" required>
            <USelectMenu
              v-model="selectedCustomerId"
              :items="debtCustomers"
              value-key="value"
              placeholder="Chọn khách hàng..."
              searchable
              class="w-full"
            />
          </UFormField>
          <!-- Customer debt info -->
          <Transition name="fade">
            <div v-if="selectedCustomer" class="p-4 rounded-xl bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UAvatar :src="selectedCustomer.avatar" :alt="selectedCustomer.label" size="sm" />
                  <div>
                    <p class="text-sm font-medium text-surface-foreground">{{ selectedCustomer.label.split(' — ')[0] }}</p>
                    <p class="text-xs text-slate-500">Hạn mức nợ</p>
                  </div>
                </div>
                <p class="text-lg font-bold text-error-600 dark:text-error-400 tabular-nums">{{ formatVND(selectedCustomer.debt) }}</p>
              </div>
            </div>
          </Transition>
          <!-- Amount -->
          <UFormField label="Số tiền thanh toán" required>
            <UInput
              v-model="amount"
              type="number"
              placeholder="Nhập số tiền..."
              icon="i-lucide-banknote"
              :ui="{ base: 'tabular-nums' }"
            />
            <template #hint>
              <span v-if="amount" class="text-primary-600 dark:text-primary-400 font-medium">{{ formatVND(amount) }}</span>
            </template>
          </UFormField>
          <!-- Note -->
          <UFormField label="Ghi chú">
            <UTextarea v-model="note" placeholder="Ghi chú thanh toán (không bắt buộc)..." :rows="3" />
          </UFormField>
          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <UButton
              color="primary"
              size="lg"
              :loading="submitting"
              :disabled="!selectedCustomerId || !amount"
              class="flex-1 justify-center"
              @click="handleSubmit"
            >
              <UIcon name="i-lucide-check" class="w-4 h-4 mr-1" /> Xác nhận thu nợ
            </UButton>
            <UButton variant="outline" color="neutral" size="lg" to="/admin/debt">
              Hủy
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
