<script setup lang="ts">
import AddressFormModal from './AddressFormModal.vue'
import type { Address } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'
import { t } from '~/utils/i18n'

const props = defineProps<{
  userId: string | number
  addresses: Address[]
  loading: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { deleteAddress } = useUsers()
const toast = useToast()
const { confirm } = useConfirmDialog()

const showAddressModal = ref(false)
const editingAddress = ref<Address | null>(null)

const openAdd = () => {
  editingAddress.value = null
  showAddressModal.value = true
}

const openEdit = (addr: Address) => {
  editingAddress.value = { ...addr }
  showAddressModal.value = true
}

const handleDelete = async (addr: Address) => {
  const confirmed = await confirm({
    title: t('admin_address_del_title'),
    description: t('admin_address_del_desc'),
    confirmLabel: t('delete'),
    color: 'error'
  })

  if (confirmed) {
    try {
      await deleteAddress(props.userId, addr.id)
      toast.add({ title: t('admin_address_del_success'), color: 'success' })
      emit('refresh')
    } catch {
      // Errors handled by API Client
    }
  }
}

const sortedAddresses = computed(() => {
  const arr = [...props.addresses]
  return arr.sort((a, b) => {
    const aIsDefault = a.isDefault || a.is_default
    const bIsDefault = b.isDefault || b.is_default
    if (aIsDefault) return -1
    if (bIsDefault) return 1
    return (
      new Date(b.createdAt || b.created_at || '').getTime() -
      new Date(a.createdAt || a.created_at || '').getTime()
    )
  })
})

const columns = [
  { accessorKey: 'address', header: t('admin_address_col_address') },
  { accessorKey: 'location', header: t('admin_address_col_location') },
  { accessorKey: 'isDefault', header: t('admin_address_col_default') },
  { accessorKey: 'actions', header: t('actions'), align: 'right' as const, width: '120px' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200">
        {{ $t('admin_address_title') }}
      </h3>
      <UButton icon="i-lucide-plus" size="sm" @click="openAdd">
        {{ $t('admin_address_btn_add') }}
      </UButton>
    </div>

    <!-- Data table -->
    <BaseDataTable
      :rows="sortedAddresses"
      :columns="columns"
      :loading="loading"
      :empty-title="$t('admin_address_empty_title')"
      :empty-description="$t('admin_address_empty_desc')"
      empty-icon="i-lucide-map-pin"
      class="bg-surface ring-surface-border min-h-[300px] rounded-xl ring-1"
    >
      <template #empty-action>
        <UButton color="primary" @click="openAdd">{{ $t('admin_address_btn_add') }}</UButton>
      </template>

      <template #actions-header>
        <div class="w-full text-right">{{ $t('actions') }}</div>
      </template>

      <template #address-cell="{ row }">
        <span class="font-medium text-slate-900 dark:text-white">
          {{ row.addressLine || row.street }}
        </span>
      </template>

      <template #location-cell="{ row }">
        <span class="text-slate-500 dark:text-zinc-400">
          {{ [row.ward, row.district, row.province || row.city].filter(Boolean).join(', ') }}
        </span>
      </template>

      <template #isDefault-cell="{ row }">
        <span
          v-if="row.isDefault || row.is_default"
          class="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 rounded px-2 py-0.5 text-xs font-medium"
        >
          {{ $t('admin_address_col_default') }}
        </span>
        <span v-else />
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UTooltip :text="$t('edit')">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-edit"
              size="sm"
              @click="openEdit(row)"
            />
          </UTooltip>
          <UTooltip :text="$t('delete')">
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              @click="handleDelete(row)"
            />
          </UTooltip>
        </div>
      </template>
    </BaseDataTable>

    <AddressFormModal
      v-model:open="showAddressModal"
      :address="editingAddress"
      :user-id="props.userId"
      @refresh="emit('refresh')"
    />
  </div>
</template>
