<script setup lang="ts">
import { Plus, Pencil, Trash2, Download, Upload, ArrowLeft } from 'lucide-vue-next'
import { mockInventoryItems, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
useHead({ title: `${t('nav.inventory')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const items = ref<Record<string, unknown>[]>([])

const showItemModal = ref(false)
const editingId = ref<string | null>(null)
const itemForm = ref({ name: '', unit: 'kg', quantity: 0 })
const saving = ref(false)
const deleteTarget = ref<string | null>(null)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    items.value = mockInventoryItems.value.filter(i => !i.deleted_at).sort((a,b) => a.name.localeCompare(b.name))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  itemForm.value = { name: '', unit: 'kg', quantity: 0 }
  showItemModal.value = true
}
function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as string
  itemForm.value = { name: row.name as string, unit: row.unit as string, quantity: Number(row.quantity) }
  showItemModal.value = true
}

async function saveItem() {
  if (!itemForm.value.name) { toast.error(t('common.required')); return }
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    if (editingId.value) {
      const index = mockInventoryItems.value.findIndex(i => i.id === editingId.value)
      if (index !== -1) Object.assign(mockInventoryItems.value[index], itemForm.value, { updated_at: new Date().toISOString() })
    } else {
      mockInventoryItems.value.push({
        id: generateId(),
        ...itemForm.value,
        estimated_cost: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
    }
    toast.success(t('common.save'))
    showItemModal.value = false
    loadData()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function deleteItem() {
  if (!deleteTarget.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockInventoryItems.value.findIndex(i => i.id === deleteTarget.value)
    if (index !== -1) mockInventoryItems.value[index].deleted_at = new Date().toISOString()
    toast.success(t('inventory.deleteSuccess'))
    deleteTarget.value = null
    loadData()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.inventory') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('inventory.items') }}</h1>
      <div class="flex gap-2">
        <NuxtLink to="/admin/inventory/import"><AppButton variant="outline"><Download class="w-4 h-4" /> {{ t('inventory.import') }}</AppButton></NuxtLink>
        <NuxtLink to="/admin/inventory/export"><AppButton variant="outline"><Upload class="w-4 h-4" /> {{ t('inventory.export') }}</AppButton></NuxtLink>
        <NuxtLink to="/admin/inventory/loss-report"><AppButton variant="outline">{{ t('inventory.lossReport') }}</AppButton></NuxtLink>
        <AppButton @click="openAdd"><Plus class="w-4 h-4" /> {{ t('inventory.addNewItem') }}</AppButton>
      </div>
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="px-4 py-3 border-b border-gray-50">
          <div class="skeleton h-5 w-full" />
        </div>
      </template>
      <template v-else-if="items.length">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.name') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.unit') }}</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('inventory.currentStock') }}</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in items" :key="item.id as string" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ item.unit }}</td>
              <td class="px-4 py-3 text-right font-medium">{{ item.quantity }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <button class="p-1.5 text-gray-400 hover:text-primary-600" @click="openEdit(item)"><Pencil class="w-4 h-4" /></button>
                  <button class="p-1.5 text-gray-400 hover:text-danger-600" @click="deleteTarget = item.id as string"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <AppEmptyState v-else :cta-text="t('inventory.addNewItem')" @action="openAdd" />
    </div>

    <AppModal v-model="showItemModal" :title="editingId ? t('inventory.editItem') : t('inventory.addNewItem')" size="sm">
      <form class="space-y-4" @submit.prevent="saveItem">
        <AppInput v-model="itemForm.name" :label="t('common.name')" :required="true" />
        <AppInput v-model="itemForm.unit" :label="t('common.unit')" />
        <AppInput v-model="itemForm.quantity" :label="t('inventory.currentStock')" type="number" :min="0" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showItemModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="saveItem">{{ t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppConfirmDialog :model-value="!!deleteTarget" :title="t('common.delete')" :message="t('inventory.deleteConfirm')" @confirm="deleteItem" @cancel="deleteTarget = null" />
  </div>
</template>
