<script setup lang="ts">
import { transactionService } from '~/services/transactionService'
import { userService } from '~/services/userService'
import type { UserDTO } from '~/utils/types'

import { z } from 'zod'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_debt_pay_seo_title') })

// ─── State ────────────────────────────────────────────────
const state = reactive({
  userId: '' as number | '',
  amount: undefined as number | undefined,
  paymentMethod: 'CASH',
  note: ''
})

const schema = z.object({
  userId: z.number({ message: t('admin_debt_pay_err_user') }),
  amount: z
    .number({ message: t('admin_debt_pay_err_amount_req') })
    .min(1000, t('admin_debt_pay_err_amount_min')),
  paymentMethod: z.string(),
  note: z.string().optional()
})

const { formErrors, formRef, validate: validateForm } = useZodForm(schema)

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
      avatar: c.profile?.avatarUrl ? { src: getImageUrl(c.profile.avatarUrl) } : undefined,
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
      navigateTo('/admin/debt')
    },
    onError: () => {
      // Handled globally
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm(state)) {
    payDebtAction(state)
  }
}
</script>
<template>
  <form @submit.prevent="handleFormSubmit">
    <BasePageHeader
      :title="$t('admin_debt_pay_title')"
      :description="$t('admin_debt_pay_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('admin_debt_title'), to: '/admin/debt' },
        { label: $t('admin_debt_pay_title') }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/debt">
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" />
          {{ $t('admin_blog_cat_btn_back') }}
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
            <h2 class="text-surface-foreground text-lg font-semibold">
              {{ $t('admin_debt_pay_card_title') }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-zinc-400">
              {{ $t('admin_debt_pay_card_desc') }}
            </p>
          </div>
        </div>
        <div class="space-y-5">
          <!-- Customer select -->
          <UFormField
            :label="$t('common_customer')"
            name="userId"
            :error="formErrors.userId"
            required
          >
            <USelectMenu
              v-model="state.userId"
              :items="debtCustomers"
              value-key="value"
              :placeholder="$t('admin_debt_pay_customer_ph')"
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
                    :src="getImageUrl(selectedCustomer.avatarUrl) || undefined"
                    :alt="selectedCustomer.label"
                    size="sm"
                  />
                  <div>
                    <p class="text-surface-foreground text-sm font-medium">
                      {{ selectedCustomer.label.split(' — ')[0] }}
                    </p>
                    <p class="text-xs text-slate-500">{{ $t('admin_debt_pay_limit') }}</p>
                  </div>
                </div>
                <p class="text-error-600 dark:text-error-400 text-lg font-bold tabular-nums">
                  {{ formatVND(selectedCustomer.debt) }}
                </p>
              </div>
            </div>
          </Transition>
          <!-- Amount -->
          <UFormField
            :label="$t('admin_debt_pay_amount')"
            name="amount"
            :error="formErrors.amount"
            required
          >
            <UInput
              v-model="state.amount"
              type="number"
              :placeholder="$t('admin_debt_pay_amount_ph')"
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
            :label="$t('admin_debt_pay_method')"
            name="paymentMethod"
            :error="formErrors.paymentMethod"
            required
          >
            <USelectMenu
              v-model="state.paymentMethod"
              :items="[
                { label: $t('admin_debt_pay_method_cash'), value: 'CASH' },
                { label: $t('admin_debt_pay_method_bank'), value: 'BANK_TRANSFER' }
              ]"
              value-key="value"
              :placeholder="$t('admin_debt_pay_method_ph')"
              class="w-full"
            />
          </UFormField>
          <!-- Note -->
          <UFormField :label="$t('admin_debt_pay_note')" name="note" :error="formErrors.note">
            <UTextarea v-model="state.note" :placeholder="$t('admin_debt_pay_note_ph')" :rows="3" />
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
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" />
              {{ $t('admin_debt_pay_btn_submit') }}
            </UButton>
            <UButton variant="outline" color="neutral" size="lg" to="/admin/debt">
              {{ $t('common_cancel') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
