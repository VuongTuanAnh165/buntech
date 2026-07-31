<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
import { TransactionType } from '../../../core/enums'
import { mockTransactions, mockUsers } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const { formatVND, formatDate } = useFormat()
useHead({ title: `${t('nav.finance')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const rows = ref<Record<string, unknown>[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const typeFilter = ref('')
const startDate = ref('')
const endDate = ref('')

watch([page, limit, typeFilter, startDate, endDate], loadData)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockTransactions.value]
    
    if (typeFilter.value) data = data.filter(tx => tx.type === typeFilter.value)
    if (startDate.value) data = data.filter(tx => tx.created_at >= new Date(startDate.value).toISOString())
    if (endDate.value) data = data.filter(tx => tx.created_at <= new Date(endDate.value + 'T23:59:59').toISOString())
    
    data.sort((a,b) => b.created_at.localeCompare(a.created_at))
    
    total.value = data.length
    
    const paginated = data.slice((page.value - 1) * limit.value, page.value * limit.value)
    rows.value = paginated.map(tx => ({
      ...tx,
      user: tx.user_id ? mockUsers.value.find(u => u.id === tx.user_id) : null
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const typeColors: Record<string, string> = {
  PAYMENT: 'success',
  REFUND: 'warning',
  DEBT_INCREASE: 'danger',
  DEBT_PAYMENT: 'secondary',
}

const columns = computed(() => [
  { key: 'id', label: 'ID', align: 'center' as const },
  { key: 'user', label: t('orders.customer') },
  { key: 'type', label: t('finance.transactionType') },
  { key: 'amount', label: t('finance.amount'), align: 'right' as const },
  { key: 'note', label: t('common.note') },
  { key: 'created_at', label: t('common.date') },
])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const typeOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...Object.values(TransactionType).map(tp => ({ value: tp, label: t(`finance.${tp}`) })),
])
onMounted(loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.finance') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('finance.transactions') }}</h1>
      <NuxtLink to="/admin/finance/pay-debt"><AppButton><Wallet class="w-4 h-4" /> {{ t('finance.payDebt') }}</AppButton></NuxtLink>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <select v-model="typeFilter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-model="startDate" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <input v-model="endDate" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <AppTable v-else :columns="columns" :rows="rows" :loading="loading" row-key="id">
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-400">{{ String(value).slice(0, 8) }}</span>
      </template>
      <template #cell-user="{ value }">
        {{ (value as Record<string, unknown>)?.full_name || '—' }}
      </template>
      <template #cell-type="{ value }">
        <AppBadge :color="typeColors[value as string]">{{ t(`finance.${value}`) }}</AppBadge>
      </template>
      <template #cell-amount="{ value }">
        <span class="font-medium">{{ formatVND(Number(value)) }}</span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-gray-500">{{ formatDate(value as string) }}</span>
      </template>
      <template #pagination>
        <AppPagination :page="page" :total-pages="totalPages" :total="total" :from="(page - 1) * limit" :to="page * limit - 1" :limit="limit" @update:page="page = $event" @update:limit="limit = $event; page = 1" />
      </template>
    </AppTable>
  </div>
</template>
