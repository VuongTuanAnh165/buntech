<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '~/utils/types'
import { ConstantKey } from '~/enums/constantKeys'
const { constants } = useMasterData()
const props = defineProps<{
  transactions: Transaction[]
  debtLimit: number
}>()
const currentDebt = computed(() => {
  let debt = 0
  for (const tx of props.transactions) {
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE) debt += tx.amount
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT) debt -= tx.amount
  }
  return debt
})
const debtRemaining = computed(() => Math.max(0, props.debtLimit - currentDebt.value))
const debtUtilization = computed(() =>
  props.debtLimit > 0 ? Math.min(100, Math.round((currentDebt.value / props.debtLimit) * 100)) : 0
)
const debtTransactions = computed(() =>
  props.transactions.filter(
    (tx) =>
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE ||
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT
  )
)
const paymentTransactions = computed(() =>
  props.transactions.filter(
    (tx) => tx.type === constants.value?.[ConstantKey.TransactionType]?.PAYMENT
  )
)
</script>
<template>
  <div class="animate-fade-in-up space-y-6">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <UCard class="stagger-item">
        <div class="mb-3 flex items-center gap-2">
          <div
            class="bg-error-50 dark:bg-error-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-wallet text-error-600 dark:text-error-400 h-4 w-4"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">Công nợ hiện tại</h2>
        </div>
        <p
          :class="[
            'text-3xl font-bold tabular-nums',
            currentDebt > 0
              ? 'text-error-600 dark:text-error-400'
              : 'text-success-600 dark:text-success-400'
          ]"
        >
          {{ formatVND(currentDebt) }}
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Từ {{ debtTransactions.length }} giao dịch
        </p>
      </UCard>
      <UCard class="stagger-item" style="animation-delay: 40ms">
        <div class="mb-3 flex items-center gap-2">
          <div
            class="bg-primary-50 dark:bg-primary-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-credit-card text-primary-600 dark:text-primary-400 h-4 w-4"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">Hạn mức công nợ</h2>
        </div>
        <p class="text-surface-foreground text-3xl font-bold tabular-nums">
          {{ formatVND(debtLimit) }}
        </p>
        <div class="mt-3">
          <div class="mb-1.5 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-zinc-400">Đã sử dụng</span>
            <span class="text-surface-foreground font-medium tabular-nums"
              >{{ debtUtilization }}%</span
            >
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              :class="[
                'h-full rounded-full transition-all duration-500',
                debtUtilization > 80
                  ? 'bg-error-500'
                  : debtUtilization > 50
                    ? 'bg-warning-500'
                    : 'bg-success-500'
              ]"
              :style="{ width: `${debtUtilization}%` }"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400 dark:text-zinc-500">
            Còn lại: {{ formatVND(debtRemaining) }}
          </p>
        </div>
      </UCard>
      <UCard class="stagger-item" style="animation-delay: 80ms">
        <div class="mb-3 flex items-center gap-2">
          <div
            class="bg-success-50 dark:bg-success-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-trending-down text-success-600 dark:text-success-400 h-4 w-4"
              aria-hidden="true"
            />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">Tổng đã thanh toán</h2>
        </div>
        <p class="text-success-600 dark:text-success-400 text-3xl font-bold tabular-nums">
          {{ formatVND(paymentTransactions.reduce((s, tx) => s + tx.amount, 0)) }}
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          {{ paymentTransactions.length }} lần thanh toán
        </p>
      </UCard>
    </div>
    <UCard class="stagger-item" style="animation-delay: 120ms">
      <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Lịch sử giao dịch</h2>
      <template v-if="transactions.length">
        <div class="space-y-0">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="border-surface-border flex items-center gap-3 border-b py-3 last:border-0"
          >
            <div
              :class="[
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE
                  ? 'bg-error-50 dark:bg-error-900/20'
                  : tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_PAYMENT ||
                      tx.type === constants?.[ConstantKey.TransactionType]?.PAYMENT
                    ? 'bg-success-50 dark:bg-success-900/20'
                    : 'bg-primary-50 dark:bg-primary-900/20'
              ]"
            >
              <span
                :class="[
                  tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE
                    ? 'i-lucide-trending-up'
                    : 'i-lucide-trending-down',
                  'h-4 w-4',
                  tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-success-600 dark:text-success-400'
                ]"
                aria-hidden="true"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-surface-foreground text-sm font-medium">
                {{
                  tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE
                    ? 'Tăng công nợ'
                    : tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_PAYMENT
                      ? 'Giảm công nợ'
                      : tx.type === constants?.[ConstantKey.TransactionType]?.PAYMENT
                        ? 'Thanh toán'
                        : 'Hoàn tiền'
                }}
              </p>
              <p class="truncate text-xs text-slate-500 dark:text-zinc-400">{{ tx.note }}</p>
              <p class="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                {{ formatDateTime(tx.created_at) }}
              </p>
            </div>
            <span
              :class="[
                'flex-shrink-0 text-sm font-semibold tabular-nums',
                tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-success-600 dark:text-success-400'
              ]"
            >
              {{ tx.type === constants?.[ConstantKey.TransactionType]?.DEBT_INCREASE ? '+' : '-'
              }}{{ formatVND(tx.amount) }}
            </span>
          </div>
        </div>
      </template>
      <BaseEmptyState
        v-else
        icon="i-lucide-file-text"
        title="Chưa có giao dịch"
        description="Lịch sử công nợ sẽ hiển thị tại đây"
      />
    </UCard>
  </div>
</template>
