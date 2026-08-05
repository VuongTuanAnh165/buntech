<script setup lang="ts">
import {
  ArrowLeft, Wallet, Users, AlertCircle, CheckCircle2, TrendingDown, TrendingUp,
  Receipt, Clock, ArrowDownToLine, ArrowUpFromLine, RotateCcw, Banknote,
} from 'lucide-vue-next'
import { TransactionType, Role } from '../../../core/enums'
import type { Transaction, Profile } from '../../../core/types'
import { mockTransactions, mockProfiles } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatDate, formatDateTime, formatNumber } = useFormat()

useHead({ title: `Thanh toán nợ - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const showConfirm = ref(false)
const paySuccess = ref(false)

const transactions = ref<Transaction[]>([...mockTransactions])
const customers = ref<Profile[]>(
  mockProfiles.filter(p => p.role === Role.CUSTOMER).sort((a, b) => a.full_name.localeCompare(b.full_name)),
)

const selectedCustomerId = ref('')
const amountRaw = ref('')
const noteInput = ref('')

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── Format helpers ──────────────────────────────────────
function parseAmount(str: string): number {
  const clean = str.replace(/[^0-9]/g, '')
  return clean ? Number(clean) : 0
}

function formatInputAmount(str: string): string {
  const n = parseAmount(str)
  return n > 0 ? new Intl.NumberFormat('vi-VN').format(n) : str
}

const amount = computed(() => parseAmount(amountRaw.value))
const formattedAmount = computed(() => formatVND(amount.value))

function onAmountInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  amountRaw.value = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : ''
}

// ─── Selected customer ──────────────────────────────────
const selectedCustomer = computed(() => customers.value.find(c => c.id === selectedCustomerId.value))

const customerOptions = computed(() =>
  customers.value.map(c => ({
    value: c.id,
    label: `${c.full_name}${c.phone ? ' — ' + c.phone : ''}`,
  })),
)

// ─── Customer debt calculation ──────────────────────────
const currentDebt = computed(() => {
  if (!selectedCustomerId.value) return 0
  let debt = 0
  for (const tx of transactions.value) {
    if (tx.user_id !== selectedCustomerId.value) continue
    if (tx.type === TransactionType.DEBT_INCREASE) debt += tx.amount
    else if (tx.type === TransactionType.DEBT_PAYMENT) debt -= tx.amount
  }
  return Math.max(0, debt)
})

const debtAfterPayment = computed(() => Math.max(0, currentDebt.value - amount.value))

// ─── Debt history for selected customer ─────────────────
const customerHistory = computed<Transaction[]>(() => {
  if (!selectedCustomerId.value) return []
  return transactions.value
    .filter(tx =>
      tx.user_id === selectedCustomerId.value &&
      (tx.type === TransactionType.DEBT_INCREASE || tx.type === TransactionType.DEBT_PAYMENT),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10)
})

// ─── Preset amounts ──────────────────────────────────────
const presetAmounts = computed(() => {
  if (currentDebt.value <= 0) return []
  const presets = [
    Math.round(currentDebt.value * 0.25),
    Math.round(currentDebt.value * 0.5),
    Math.round(currentDebt.value * 0.75),
    currentDebt.value,
  ]
  return presets.filter(p => p > 0).map(p => ({
    label: p === currentDebt.value ? 'Toàn bộ' : formatVND(p),
    value: p,
  }))
})

function setPreset(p: number) {
  amountRaw.value = new Intl.NumberFormat('vi-VN').format(p)
}

// ─── Validation ──────────────────────────────────────────
const amountError = computed(() => {
  if (!amountRaw.value) return ''
  if (amount.value <= 0) return 'Số tiền phải lớn hơn 0'
  if (amount.value > currentDebt.value && currentDebt.value > 0) return `Số tiền không được vượt quá nợ hiện tại (${formatVND(currentDebt.value)})`
  return ''
})

const canSubmit = computed(() =>
  !!selectedCustomerId.value && amount.value > 0 && !amountError.value && currentDebt.value > 0,
)

// ─── Confirm & process payment ───────────────────────────
function openConfirm() {
  if (!canSubmit.value) {
    if (!selectedCustomerId.value) toast.error('Vui lòng chọn khách hàng')
    else if (amount.value <= 0) toast.error('Vui lòng nhập số tiền thanh toán')
    else if (currentDebt.value <= 0) toast.warning('Khách hàng này không có nợ')
    return
  }
  showConfirm.value = true
}

function confirmPay() {
  saving.value = true
  setTimeout(() => {
    const newTx: Transaction = {
      id: `txn-${Date.now()}`,
      user_id: selectedCustomerId.value,
      user: selectedCustomer.value || null,
      order_id: null,
      type: TransactionType.DEBT_PAYMENT,
      amount: amount.value,
      note: noteInput.value || 'Thanh toán nợ',
      created_at: new Date().toISOString(),
    }
    transactions.value.unshift(newTx)

    showConfirm.value = false
    saving.value = false
    paySuccess.value = true
    toast.success(`Đã thanh toán ${formattedAmount.value} cho ${selectedCustomer.value?.full_name}`)

    amountRaw.value = ''
    noteInput.value = ''

    setTimeout(() => { paySuccess.value = false }, 3000)
  }, 500)
}

const typeLabels: Record<TransactionType, string> = {
  [TransactionType.PAYMENT]: 'Thanh toán',
  [TransactionType.REFUND]: 'Hoàn tiền',
  [TransactionType.DEBT_INCREASE]: 'Tăng nợ',
  [TransactionType.DEBT_PAYMENT]: 'Trả nợ',
}
const typeColors: Record<TransactionType, string> = {
  [TransactionType.PAYMENT]: 'success',
  [TransactionType.REFUND]: 'warning',
  [TransactionType.DEBT_INCREASE]: 'danger',
  [TransactionType.DEBT_PAYMENT]: 'secondary',
}
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Tài chính', to: '/admin/finance' }, { label: 'Thanh toán nợ' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
      <div class="min-w-0">
        <h1 class="page-title flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-900/30 flex items-center justify-center">
            <Wallet class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </span>
          Thanh toán nợ khách hàng
        </h1>
        <p class="page-subtitle">Ghi nhận khách hàng trả tiền nợ cho xưởng</p>
      </div>
      <AppButton variant="ghost" @click="router.push('/admin/finance')">
        <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
      </AppButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT: Payment Form -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Customer Select -->
        <div class="card p-5 stagger-item animate-fade-in-up" style="animation-delay: 40ms">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Users class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h2 class="text-sm font-semibold text-surface-foreground">Chọn khách hàng</h2>
          </div>
          <template v-if="loading">
            <AppSkeleton height="h-11" />
          </template>
          <template v-else>
            <AppSelect
              v-model="selectedCustomerId"
              :options="customerOptions"
              placeholder="Tìm và chọn khách hàng..."
              :searchable="true"
              :required="true"
            />
          </template>
        </div>

        <!-- Debt Display Card -->
        <Transition name="fade">
          <div v-if="selectedCustomerId" class="animate-fade-in-up" style="animation-delay: 60ms">
            <!-- Success flash -->
            <Transition name="fade">
              <div v-if="paySuccess" class="mb-4 p-4 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/40 flex items-center gap-3">
                <CheckCircle2 class="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p class="text-sm font-semibold text-success-700 dark:text-success-300">Thanh toán thành công!</p>
                  <p class="text-xs text-success-600/70 dark:text-success-400/70">Giao dịch đã được ghi nhận</p>
                </div>
              </div>
            </Transition>

            <!-- Debt summary -->
            <div class="card p-5 mb-5">
              <div class="flex items-center justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                  <AppAvatar :name="selectedCustomer?.full_name || ''" :src="selectedCustomer?.avatar_url || null" size="md" />
                  <div>
                    <p class="font-semibold text-surface-foreground">{{ selectedCustomer?.full_name }}</p>
                    <p class="text-sm text-slate-500 dark:text-zinc-400">{{ selectedCustomer?.phone || '—' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Nợ hiện tại</p>
                  <p
                    :class="[
                      'text-3xl font-bold tabular-nums transition-colors',
                      currentDebt > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400',
                    ]"
                  >
                    {{ formatVND(currentDebt) }}
                  </p>
                </div>
              </div>

              <!-- No debt state -->
              <div v-if="currentDebt === 0" class="flex items-center gap-3 p-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-900/40">
                <CheckCircle2 class="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" aria-hidden="true" />
                <p class="text-sm font-medium text-success-700 dark:text-success-300">Khách hàng này không có nợ</p>
              </div>

              <!-- Debt limit bar -->
              <div v-if="currentDebt > 0 && selectedCustomer" class="mt-2">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                  <span>Hạn mức nợ: {{ formatVND(selectedCustomer.debt_limit) }}</span>
                  <span class="tabular-nums">{{ Math.round((currentDebt / Math.max(1, selectedCustomer.debt_limit)) * 100) }}%</span>
                </div>
                <div class="h-2 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-500',
                      currentDebt / Math.max(1, selectedCustomer.debt_limit) >= 0.8 ? 'bg-danger-500' :
                      currentDebt / Math.max(1, selectedCustomer.debt_limit) >= 0.5 ? 'bg-warning-500' :
                      'bg-success-500',
                    ]"
                    :style="{ width: `${Math.min(100, Math.round((currentDebt / Math.max(1, selectedCustomer.debt_limit)) * 100))}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- Payment Form -->
            <div v-if="currentDebt > 0" class="card p-5 space-y-5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <Banknote class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h3 class="text-sm font-semibold text-surface-foreground">Nhập số tiền thanh toán</h3>
              </div>

              <!-- Preset amounts -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in presetAmounts"
                  :key="preset.value"
                  type="button"
                  :class="[
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                    amount === preset.value
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-surface text-slate-600 dark:text-zinc-300 border-surface-border hover:bg-surface-hover',
                  ]"
                  @click="setPreset(preset.value)"
                >
                  {{ preset.label }}
                </button>
              </div>

              <div class="relative">
                <label class="form-label" for="amount-input">
                  Số tiền thanh toán <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-sm font-semibold text-slate-500 dark:text-zinc-400">₫</span>
                  <input
                    id="amount-input"
                    type="text"
                    inputmode="numeric"
                    :value="amountRaw"
                    :placeholder="formatVND(currentDebt)"
                    :class="[
                      'form-input pl-8',
                      amountError ? 'border-danger-300 dark:border-danger-700 focus:ring-danger-400' : '',
                    ]"
                    @input="onAmountInput"
                  >
                </div>
                <p v-if="amountError" class="mt-1 text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {{ amountError }}
                </p>
              </div>

              <!-- After payment preview -->
              <Transition name="fade">
                <div v-if="amount > 0 && !amountError" class="p-4 rounded-xl bg-surface-muted border border-surface-border">
                  <p class="text-sm font-medium text-surface-foreground mb-2">Sau khi thanh toán:</p>
                  <div class="flex items-center gap-3">
                    <div class="text-center">
                      <p class="text-xs text-slate-500 dark:text-zinc-400">Hiện tại</p>
                      <p class="text-lg font-bold text-danger-600 dark:text-danger-400 tabular-nums">{{ formatVND(currentDebt) }}</p>
                    </div>
                    <TrendingDown class="w-5 h-5 text-success-500 flex-shrink-0 mx-1" aria-hidden="true" />
                    <div class="text-center">
                      <p class="text-xs text-slate-500 dark:text-zinc-400">Thanh toán</p>
                      <p class="text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formattedAmount }}</p>
                    </div>
                    <span class="text-slate-400">=</span>
                    <div class="text-center">
                      <p class="text-xs text-slate-500 dark:text-zinc-400">Còn lại</p>
                      <p :class="['text-lg font-bold tabular-nums', debtAfterPayment === 0 ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400']">
                        {{ formatVND(debtAfterPayment) }}
                      </p>
                    </div>
                  </div>
                </div>
              </Transition>

              <div>
                <label class="form-label" for="note-input">Ghi chú</label>
                <input
                  id="note-input"
                  v-model="noteInput"
                  type="text"
                  placeholder="Ghi chú về lần thanh toán này..."
                  class="form-input"
                >
              </div>

              <AppButton block size="lg" :disabled="!canSubmit" @click="openConfirm">
                <Wallet class="w-4 h-4" aria-hidden="true" /> Xác nhận thanh toán {{ amount > 0 ? formattedAmount : '' }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>

      <!-- RIGHT: Debt History -->
      <div class="card p-5 stagger-item" style="animation-delay: 120ms">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
            <Receipt class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-foreground">Lịch sử nợ</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400">10 giao dịch gần nhất</p>
          </div>
        </div>

        <!-- No customer selected -->
        <div v-if="!selectedCustomerId" class="text-center py-12">
          <div class="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-3">
            <Users class="w-7 h-7 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
          </div>
          <p class="text-sm text-slate-500 dark:text-zinc-400">Chọn khách hàng để xem lịch sử nợ</p>
        </div>

        <!-- History list -->
        <template v-else-if="customerHistory.length">
          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-px bg-surface-border" aria-hidden="true" />
            <div
              v-for="(tx, i) in customerHistory"
              :key="tx.id"
              class="relative flex gap-3 pb-4 last:pb-0 stagger-item"
              :style="{ animationDelay: `${i * 30}ms` }"
            >
              <div
                :class="[
                  'relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-4 ring-surface',
                  tx.type === TransactionType.DEBT_INCREASE ? 'bg-danger-50 dark:bg-danger-900/20' : 'bg-success-50 dark:bg-success-900/20',
                ]"
              >
                <component
                  :is="tx.type === TransactionType.DEBT_INCREASE ? TrendingUp : TrendingDown"
                  :class="['w-4 h-4', tx.type === TransactionType.DEBT_INCREASE ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']"
                  aria-hidden="true"
                />
              </div>
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex items-start justify-between gap-2 mb-0.5">
                  <p class="text-sm font-medium text-surface-foreground">
                    {{ typeLabels[tx.type] }}
                  </p>
                  <span :class="['text-sm font-semibold tabular-nums flex-shrink-0', tx.type === TransactionType.DEBT_INCREASE ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">
                    {{ tx.type === TransactionType.DEBT_INCREASE ? '+' : '−' }}{{ formatVND(tx.amount) }}
                  </span>
                </div>
                <p v-if="tx.note" class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ tx.note }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5 tabular-nums">
                  <Clock class="w-3 h-3" aria-hidden="true" /> {{ formatDate(tx.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <AppEmptyState v-else description="Khách hàng này chưa có giao dịch nợ nào." />
      </div>
    </div>

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      :model-value="showConfirm"
      title="Xác nhận thanh toán nợ"
      :message="`Bạn xác nhận thu ${formattedAmount} tiền nợ từ khách hàng ${selectedCustomer?.full_name || ''}?`"
      variant="primary"
      :loading="saving"
      @confirm="confirmPay"
      @cancel="showConfirm = false"
    />
  </div>
</template>
