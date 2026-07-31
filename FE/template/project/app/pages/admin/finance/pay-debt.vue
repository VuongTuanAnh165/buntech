<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { TransactionType } from '../../../core/enums'
import { mockUsers, mockTransactions, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, parseVNDInput, formatVNDInput } = useFormat()
useHead({ title: `${t('finance.payDebt')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const customers = ref<Record<string, unknown>[]>([])
const selectedCustomerId = ref('')
const currentDebt = ref(0)
const amountInput = ref('')
const saving = ref(false)
const showConfirm = ref(false)

async function loadCustomers() {
  await new Promise(r => setTimeout(r, 300))
  customers.value = mockUsers.value.filter(u => u.role === 'CUSTOMER' && u.status === 'ACTIVE').sort((a,b) => a.full_name.localeCompare(b.full_name))
}

async function onCustomerChange() {
  if (!selectedCustomerId.value) { currentDebt.value = 0; return }
  await new Promise(r => setTimeout(r, 300))
  const txns = mockTransactions.value.filter(tx => tx.user_id === selectedCustomerId.value)
  let debt = 0
  for (const tx of txns) {
    if (tx.type === TransactionType.DEBT_INCREASE) debt += Number(tx.amount)
    if (tx.type === TransactionType.DEBT_PAYMENT) debt -= Number(tx.amount)
  }
  currentDebt.value = debt
}

async function confirmPay() {
  saving.value = true
  try {
    const amount = parseVNDInput(amountInput.value)
    if (amount <= 0) { toast.error(t('common.required')); saving.value = false; return }
    await new Promise(r => setTimeout(r, 300))
    mockTransactions.value.push({
      id: generateId(),
      user_id: selectedCustomerId.value,
      type: TransactionType.DEBT_PAYMENT,
      amount,
      note: 'Thanh toán nợ',
      created_at: new Date().toISOString()
    })
    toast.success(t('finance.payDebtSuccess'))
    amountInput.value = ''
    showConfirm.value = false
    onCustomerChange()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

const amount = computed(() => parseVNDInput(amountInput.value))
const customerName = computed(() => customers.value.find(c => c.id === selectedCustomerId.value)?.full_name || '')

onMounted(loadCustomers)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.finance'), to: '/admin/finance' }, { label: t('finance.payDebt') }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/finance')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('finance.payDebt') }}</h1>

    <div class="max-w-lg bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <AppSelect
        v-model="selectedCustomerId"
        :label="t('orders.selectCustomer')"
        :required="true"
        :options="customers.map(c => ({ value: c.id as string, label: `${c.full_name} - ${c.phone}` }))"
        :placeholder="t('orders.selectCustomer')"
        @update:model-value="onCustomerChange"
      />
      <div v-if="selectedCustomerId" class="p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-500">{{ t('customers.currentDebt') }}</p>
        <p :class="['text-2xl font-bold', currentDebt > 0 ? 'text-danger-600' : 'text-success-600']">{{ formatVND(currentDebt) }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('finance.amount') }} <span class="text-danger-500">*</span></label>
        <input
          v-model="amountInput"
          type="text"
          :placeholder="formatVNDInput(currentDebt)"
          class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
      </div>
      <AppButton :disabled="!selectedCustomerId || amount <= 0" block @click="showConfirm = true">{{ t('finance.payDebt') }}</AppButton>
    </div>

    <AppConfirmDialog
      :model-value="showConfirm"
      :title="t('finance.payDebt')"
      :message="t('finance.payDebtConfirm', { amount: formatVND(amount), name: customerName })"
      variant="primary"
      @confirm="confirmPay"
      @cancel="showConfirm = false"
    />
  </div>
</template>
