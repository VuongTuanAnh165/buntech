<script setup lang="ts">
import { transactionService } from '~/services/transactionService'
import { userService } from '~/services/userService'
import type { UserDTO } from '~/utils/types'

import { z } from 'zod'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Thu nợ - BunTech Admin' })
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const state = reactive({
  userId: '' as number | '',
  amount: undefined as number | undefined,
  paymentMethod: 'CASH',
  note: ''
})

const schema = z.object({
  userId: z.number({ message: 'Vui lòng chọn khách hàng' }),
  amount: z.number({ message: 'Vui lòng nhập số tiền' }).min(1000, 'Số tiền tối thiểu 1.000đ'),
  paymentMethod: z.string(),
  note: z.string().optional()
})

const formErrors = ref<Record<string, string>>({})

const formRef = ref({
  setErrors: (errors: { path: string; message: string }[]) => {
    formErrors.value = {}
    errors.forEach((e) => {
      formErrors.value[e.path] = e.message
    })
  },
  clearErrors: () => {
    formErrors.value = {}
  }
})

const validateForm = () => {
  formRef.value.clearErrors()
  const result = schema.safeParse(state)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path[0]?.toString() || '',
      message: issue.message
    }))
    formRef.value.setErrors(errors)
    return false
  }
  return true
}

// ─── Data Fetching ────────────────────────────────────────
const { data: usersResponse } = useAsyncData('debt-customers', async () => {
  const res = await userService.fetchUsers({ role: 'CUSTOMER', limit: 500 })
  return res.data
})

// ─── Computed ─────────────────────────────────────────────
const debtCustomers = computed(() => {
  if (!usersResponse.value?.data) return []
  return usersResponse.value.data
    .filter((c: UserDTO) => Number(c.profile?.currentDebt) > 0)
    .map((c: UserDTO) => ({
      label: `${c.fullName} — ${c.phoneNumber}`,
      value: c.id,
      avatar: c.profile?.avatarUrl ? { src: c.profile.avatarUrl } : undefined,
      avatarUrl: c.profile?.avatarUrl || undefined,
      debt: Number(c.profile?.currentDebt) || 0
    }))
})

const selectedCustomer = computed(() => debtCustomers.value.find((c) => c.value === state.userId))

// ─── Handlers ─────────────────────────────────────────────
const { handleSubmit, isSubmitting } = useFormSubmit()

const payDebtAction = handleSubmit(
  async (data: typeof state) => {
    await transactionService.payDebt({
      userId: data.userId as number,
      amount: data.amount!,
      paymentMethod: data.paymentMethod,
      note: data.note
    })
  },
  {
    formRef,
    onSuccess: () => {
      toast.add({
        title: 'Thu nợ thành công',
        description: `Đã ghi nhận ${formatVND(state.amount)} từ khách hàng`,
        color: 'success'
      })
      navigateTo('/admin/debt')
    },
    onError: (err: unknown) => {
      toast.add({
        title: 'Thất bại',
        description: err instanceof Error ? err.message : String(err),
        color: 'error'
      })
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    payDebtAction(state)
  }
}
</script>
<template>
  <form @submit.prevent="handleFormSubmit">
    <BasePageHeader
      title="Thu nợ"
      description="Ghi nhận khách trả nợ"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Tài chính', to: '/admin/debt' },
        { label: 'Thu nợ' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/debt">
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
            <UIcon name="i-lucide-wallet" class="text-primary-600 dark:text-primary-400 h-5 w-5" />
          </div>
          <div>
            <h2 class="text-surface-foreground text-lg font-semibold">Ghi nhận thanh toán</h2>
            <p class="text-sm text-slate-500 dark:text-zinc-400">
              Chọn khách hàng và nhập số tiền trả nợ
            </p>
          </div>
        </div>
        <div class="space-y-5">
          <!-- Customer select -->
          <UFormField label="Khách hàng" name="userId" :error="formErrors.userId" required>
            <USelectMenu
              v-model="state.userId"
              :items="debtCustomers"
              value-key="value"
              placeholder="Chọn khách hàng..."
              searchable
              class="w-full"
            />
          </UFormField>
          <!-- Customer debt info -->
          <Transition name="fade">
            <div
              v-if="selectedCustomer"
              class="bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30 rounded-xl border p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :src="selectedCustomer.avatarUrl"
                    :alt="selectedCustomer.label"
                    size="sm"
                  />
                  <div>
                    <p class="text-surface-foreground text-sm font-medium">
                      {{ selectedCustomer.label.split(' — ')[0] }}
                    </p>
                    <p class="text-xs text-slate-500">Hạn mức nợ</p>
                  </div>
                </div>
                <p class="text-error-600 dark:text-error-400 text-lg font-bold tabular-nums">
                  {{ formatVND(selectedCustomer.debt) }}
                </p>
              </div>
            </div>
          </Transition>
          <!-- Amount -->
          <UFormField label="Số tiền thanh toán" name="amount" :error="formErrors.amount" required>
            <UInput
              v-model="state.amount"
              type="number"
              placeholder="Nhập số tiền..."
              icon="i-lucide-banknote"
              :ui="{ base: 'tabular-nums' }"
            />
            <template #hint>
              <span
                v-if="state.amount"
                class="text-primary-600 dark:text-primary-400 font-medium"
                >{{ formatVND(state.amount) }}</span
              >
            </template>
          </UFormField>
          <!-- Payment Method -->
          <UFormField
            label="Phương thức thanh toán"
            name="paymentMethod"
            :error="formErrors.paymentMethod"
            required
          >
            <USelectMenu
              v-model="state.paymentMethod"
              :items="[
                { label: 'Tiền mặt', value: 'CASH' },
                { label: 'Chuyển khoản', value: 'BANK_TRANSFER' }
              ]"
              value-key="value"
              placeholder="Chọn phương thức..."
              class="w-full"
            />
          </UFormField>
          <!-- Note -->
          <UFormField label="Ghi chú" name="note" :error="formErrors.note">
            <UTextarea
              v-model="state.note"
              placeholder="Ghi chú thanh toán (không bắt buộc)..."
              :rows="3"
            />
          </UFormField>
          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :loading="isSubmitting"
              class="flex-1 justify-center"
            >
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> Xác nhận thu nợ
            </UButton>
            <UButton variant="outline" color="neutral" size="lg" to="/admin/debt"> Hủy </UButton>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
