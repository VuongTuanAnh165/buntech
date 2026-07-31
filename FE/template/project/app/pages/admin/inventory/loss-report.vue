<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { mockInventoryMovements, mockOrderItems } from '~/core/mockData'
import { InventoryMovementType } from '~/core/enums'

const { t } = useI18n()
const router = useRouter()
useHead({ title: `${t('inventory.lossReport')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const riceInput = ref(0)
const noodleOutput = ref(0)
const lossRate = computed(() => {
  if (riceInput.value === 0) return 0
  return ((riceInput.value - noodleOutput.value) / riceInput.value * 100)
})

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const today = new Date()
    const monthAgo = new Date(today.getTime() - 30 * 86400000).toISOString()
    
    const recentImports = mockInventoryMovements.value.filter(m => m.type === InventoryMovementType.IMPORT && m.created_at >= monthAgo)
    const recentOrders = mockOrderItems.value
    
    riceInput.value = recentImports.reduce((sum, r) => sum + Number(r.quantity), 0)
    noodleOutput.value = recentOrders.reduce((sum, r) => sum + Number(r.quantity), 0)
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.inventory'), to: '/admin/inventory' }, { label: t('inventory.lossReport') }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/inventory')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('inventory.lossReport') }}</h1>

    <template v-if="loading">
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <p class="text-sm text-gray-500 mb-1">{{ t('inventory.riceInput') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ riceInput }} kg</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <p class="text-sm text-gray-500 mb-1">{{ t('inventory.noodleOutput') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ noodleOutput }} kg</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <p class="text-sm text-gray-500 mb-1">{{ t('inventory.lossRate') }}</p>
          <p :class="['text-2xl font-bold', lossRate > 15 ? 'text-danger-600' : lossRate > 5 ? 'text-warning-600' : 'text-success-600']">
            {{ lossRate.toFixed(1) }}%
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
