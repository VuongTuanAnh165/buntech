<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { mockInventoryItems, mockInventoryMovements, generateId } from '~/core/mockData'
import { InventoryMovementType } from '~/core/enums'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
useHead({ title: `${t('inventory.import')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const items = ref<Record<string, unknown>[]>([])
const selectedItemId = ref('')
const quantity = ref(0)
const note = ref('')
const saving = ref(false)
const error = ref(false)

async function loadItems() {
  await new Promise(r => setTimeout(r, 300))
  items.value = mockInventoryItems.value.filter(i => !i.deleted_at).sort((a,b) => a.name.localeCompare(b.name))
}

async function submit() {
  if (!selectedItemId.value || quantity.value <= 0) { toast.error(t('common.required')); return }
  saving.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const itemIdx = mockInventoryItems.value.findIndex(i => i.id === selectedItemId.value)
    if (itemIdx === -1) throw new Error()
    
    mockInventoryItems.value[itemIdx].quantity += quantity.value
    
    mockInventoryMovements.value.push({
      id: generateId(),
      inventory_id: selectedItemId.value,
      type: InventoryMovementType.IMPORT,
      quantity: quantity.value,
      note: note.value,
      created_at: new Date().toISOString()
    })
    
    toast.success(t('inventory.importSuccess'))
    quantity.value = 0
    note.value = ''
    loadItems()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

onMounted(loadItems)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.inventory'), to: '/admin/inventory' }, { label: t('inventory.import') }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/inventory')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('inventory.importTitle') }}</h1>

    <div class="max-w-lg bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <AppSelect
        v-model="selectedItemId"
        :label="t('inventory.selectItem')"
        :required="true"
        :options="items.map(i => ({ value: i.id as string, label: `${i.name} (${i.quantity} ${i.unit})` }))"
        :placeholder="t('inventory.selectItem')"
      />
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('common.quantity') }} <span class="text-danger-500">*</span></label>
        <input
          v-model="quantity"
          type="number"
          :min="1"
          :class="['w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500', error ? 'border-danger-500' : 'border-gray-300']"
        >
      </div>
      <AppInput v-model="note" :label="t('common.note')" />
      <AppButton :loading="saving" block @click="submit">{{ t('inventory.import') }}</AppButton>
    </div>
  </div>
</template>
