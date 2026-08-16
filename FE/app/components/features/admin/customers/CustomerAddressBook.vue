<script setup lang="ts">
import { ref, computed } from 'vue'
import AddressFormModal from './AddressFormModal.vue'
import type { Address } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'

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
    title: 'Xóa địa chỉ',
    description: `Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.`,
    confirmLabel: 'Xóa',
    color: 'error'
  })

  if (confirmed) {
    try {
      await deleteAddress(props.userId, addr.id)
      toast.add({ title: 'Xóa địa chỉ thành công', color: 'success' })
      emit('refresh')
    } catch {
      // Errors handled by API Client
    }
  }
}

const sortedAddresses = computed(() => {
  const arr = [...props.addresses]
  return arr.sort((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const columns = [
  { accessorKey: 'address', header: 'Địa chỉ' },
  { accessorKey: 'location', header: 'Khu vực' },
  { accessorKey: 'isDefault', header: 'Mặc định' },
  { accessorKey: 'actions', header: 'Thao tác', align: 'right' as const, width: '120px' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200">Sổ địa chỉ</h3>
      <UButton icon="i-lucide-plus" size="sm" @click="openAdd"> Thêm địa chỉ mới </UButton>
    </div>

    <!-- Data table -->
    <BaseDataTable
      :rows="sortedAddresses"
      :columns="columns"
      :loading="loading"
      empty-title="Chưa có địa chỉ nào"
      empty-description="Khách hàng chưa có địa chỉ nào trong sổ."
      empty-icon="i-lucide-map-pin"
      class="bg-surface ring-surface-border min-h-[300px] rounded-xl ring-1"
    >
      <template #empty-action>
        <UButton color="primary" @click="openAdd">Thêm địa chỉ mới</UButton>
      </template>

      <template #actions-header>
        <div class="w-full text-right">Thao tác</div>
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
          v-if="row.isDefault"
          class="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 rounded px-2 py-0.5 text-xs font-medium"
        >
          Mặc định
        </span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UTooltip text="Chỉnh sửa">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-edit"
              size="sm"
              @click="openEdit(row)"
            />
          </UTooltip>
          <UTooltip text="Xóa">
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
