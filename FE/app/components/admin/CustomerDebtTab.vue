<script setup lang="ts">
import { computed } from 'vue'
import { TransactionType } from '~/utils/mockData'
import type { Transaction } from '~/utils/mockData'
const props = defineProps<{
  transactions: Transaction[]
  debtLimit: number
}>()
const currentDebt = computed(() => {
  let debt = 0
  for (const tx of props.transactions) {
    if (tx.type === TransactionType.DEBT_INCREASE) debt += tx.amount
    if (tx.type === TransactionType.DEBT_PAYMENT) debt -= tx.amount
  }
  return debt
})
const debtRemaining = computed(() => Math.max(0, props.debtLimit - currentDebt.value))
const debtUtilization = computed(() => props.debtLimit > 0 ? Math.min(100, Math.round((currentDebt.value / props.debtLimit) * 100)) : 0)
const debtTransactions = computed(() =>
  props.transactions.filter(tx =>
    tx.type === TransactionType.DEBT_INCREASE || tx.type === TransactionType.DEBT_PAYMENT
  )
)
const paymentTransactions = computed(() =>
  props.transactions.filter(tx => tx.type === TransactionType.PAYMENT)
)
</script>
<template>
  <div class="space-y-6 animate-fade-in-up">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <UCard class="stagger-item">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-error-50 dark:bg-error-900/20 flex items-center justify-center">
            <span class="i-lucide-wallet w-4 h-4 text-error-600 dark:text-error-400" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Công nợ hiện tại</h2>
        </div>
        <p :class="['text-3xl font-bold tabular-nums', currentDebt > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400']">
          {{ formatVND(currentDebt) }}
        </p>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Từ {{ debtTransactions.length }} giao dịch</p>
      </UCard>
      <UCard class="stagger-item" style="animation-delay: 40ms">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <span class="i-lucide-credit-card w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Hạn mức công nợ</h2>
        </div>
        <p class="text-3xl font-bold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
        <div class="mt-3">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="text-slate-500 dark:text-zinc-400">Đã sử dụng</span>
            <span class="font-medium text-surface-foreground tabular-nums">{{ debtUtilization }}%</span>
          </div>
          <div class="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all duration-500', debtUtilization > 80 ? 'bg-error-500' : debtUtilization > 50 ? 'bg-warning-500' : 'bg-success-500']"
              :style="{ width: `${debtUtilization}%` }"
            />
          </div>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">Còn lại: {{ formatVND(debtRemaining) }}</p>
        </div>
      </UCard>
      <UCard class="stagger-item" style="animation-delay: 80ms">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
            <span class="i-lucide-trending-down w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Tổng đã thanh toán</h2>
        </div>
        <p class="text-3xl font-bold text-success-600 dark:text-success-400 tabular-nums">
          {{ formatVND(paymentTransactions.reduce((s, tx) => s + tx.amount, 0)) }}
        </p>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ paymentTransactions.length }} lần thanh toán</p>
      </UCard>
    </div>
    <UCard class="stagger-item" style="animation-delay: 120ms">
      <h2 class="text-sm font-semibold text-surface-foreground mb-4">Lịch sử giao dịch</h2>
      <template v-if="transactions.length">
        <div class="space-y-0">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="flex items-center gap-3 py-3 border-b border-surface-border last:border-0"
          >
            <div :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              tx.type === TransactionType.DEBT_INCREASE
                ? 'bg-error-50 dark:bg-error-900/20'
                : tx.type === TransactionType.DEBT_PAYMENT || tx.type === TransactionType.PAYMENT
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-primary-50 dark:bg-primary-900/20',
            ]">
              <span
                :class="[
                  tx.type === TransactionType.DEBT_INCREASE ? 'i-lucide-trending-up' : 'i-lucide-trending-down',
                  'w-4 h-4',
                  tx.type === TransactionType.DEBT_INCREASE
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-success-600 dark:text-success-400',
                ]"
                aria-hidden="true"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-foreground">
                {{ tx.type === TransactionType.DEBT_INCREASE ? 'Tăng công nợ' : tx.type === TransactionType.DEBT_PAYMENT ? 'Giảm công nợ' : tx.type === TransactionType.PAYMENT ? 'Thanh toán' : 'Hoàn tiền' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ tx.note }}</p>
              <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ formatDateTime(tx.created_at) }}</p>
            </div>
            <span :class="[
              'text-sm font-semibold tabular-nums flex-shrink-0',
              tx.type === TransactionType.DEBT_INCREASE ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400',
            ]">
              {{ tx.type === TransactionType.DEBT_INCREASE ? '+' : '-' }}{{ formatVND(tx.amount) }}
            </span>
          </div>
        </div>
      </template>
      <BaseEmptyState v-else icon="i-lucide-file-text" title="Chưa có giao dịch" description="Lịch sử công nợ sẽ hiển thị tại đây" />
    </UCard>
  </div>
</template>
