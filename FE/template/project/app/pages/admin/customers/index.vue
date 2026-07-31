<script setup lang="ts">
import { Plus, Pencil, Trash2, Eye, Phone, Mail } from 'lucide-vue-next'
import { mockUsers, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND } = useFormat()
useHead({ title: `${t('nav.customers')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const { handleError } = useErrorHandler()
const rows = ref<Record<string, unknown>[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const roleFilter = ref('')
const statusFilter = ref('')

const showDrawer = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ full_name: '', phone: '', email: '', password: '', debt_limit: 0, status: 'ACTIVE' })
const formErrors = ref<Record<string, string>>({})
const saving = ref(false)
const deleteTarget = ref<string | null>(null)

const debouncedSearch = useDebounce(search, 300)
const { readFromQuery } = useSyncQuery({ search: debouncedSearch, sortBy, sortDirection, page, limit, roleFilter, statusFilter })
watch([debouncedSearch, page, limit, sortBy, sortDirection, roleFilter, statusFilter], loadData)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = mockUsers.value.filter(u => u.role !== 'ADMIN')

    if (debouncedSearch.value) {
      const s = debouncedSearch.value.toLowerCase()
      data = data.filter(u => u.full_name?.toLowerCase().includes(s) || u.phone?.includes(s))
    }
    if (roleFilter.value) data = data.filter(u => u.role === roleFilter.value)
    if (statusFilter.value) data = data.filter(u => u.status === statusFilter.value)

    data.sort((a, b) => {
      const aVal = a[sortBy.value as keyof typeof a]
      const bVal = b[sortBy.value as keyof typeof b]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const asc = sortDirection.value === 'asc' ? 1 : -1
      return (aVal < bVal ? -1 : 1) * asc
    })

    total.value = data.length
    rows.value = data.slice((page.value - 1) * limit.value, page.value * limit.value)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { full_name: '', phone: '', email: '', password: '', debt_limit: 0, status: 'ACTIVE' }
  formErrors.value = {}
  showDrawer.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as string
  form.value = {
    full_name: row.full_name as string || '',
    phone: row.phone as string || '',
    email: '',
    password: '',
    debt_limit: Number(row.debt_limit) || 0,
    status: row.status as string || 'ACTIVE',
  }
  formErrors.value = {}
  showDrawer.value = true
}

function validateForm() {
  formErrors.value = {}
  if (!form.value.full_name) formErrors.value.full_name = t('common.required')
  if (form.value.phone && !/^(0[0-9]{9,10})$/.test(form.value.phone)) {
    formErrors.value.phone = t('auth.phoneInvalid')
  }
  if (!editingId.value && form.value.password.length < 6) {
    formErrors.value.password = t('auth.passwordTooShort')
  }
  return Object.keys(formErrors.value).length === 0
}

async function saveCustomer() {
  if (!validateForm()) return
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    if (editingId.value) {
      const index = mockUsers.value.findIndex(u => u.id === editingId.value)
      if (index !== -1) {
        mockUsers.value[index] = {
          ...mockUsers.value[index],
          full_name: form.value.full_name,
          phone: form.value.phone,
          debt_limit: form.value.debt_limit,
          status: form.value.status as 'ACTIVE' | 'INACTIVE'
        }
      }
    } else {
      mockUsers.value.push({
        id: generateId(),
        email: form.value.email,
        full_name: form.value.full_name,
        phone: form.value.phone,
        debt_limit: form.value.debt_limit,
        status: form.value.status as 'ACTIVE' | 'INACTIVE',
        role: 'CUSTOMER',
        created_at: new Date().toISOString(),
        avatar_url: null,
      })
    }
    toast.success(t('customers.saveSuccess'))
    showDrawer.value = false
    loadData()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function deleteCustomer() {
  if (!deleteTarget.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockUsers.value.findIndex(u => u.id === deleteTarget.value)
    if (index !== -1) mockUsers.value.splice(index, 1)
    toast.success(t('customers.deleteSuccess'))
    deleteTarget.value = null
    loadData()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}

const columns = computed(() => [
  { key: 'id', label: 'ID', align: 'center' as const, sortable: false },
  { key: 'full_name', label: t('common.name'), sortable: true },
  { key: 'phone', label: t('common.phone'), sortable: false },
  { key: 'role', label: t('common.role'), sortable: true },
  { key: 'status', label: t('common.status'), sortable: true },
  { key: 'debt_limit', label: t('customers.debtLimit'), align: 'right' as const, sortable: true },
  { key: 'actions', label: t('common.actions'), align: 'right' as const, fixed: 'right' as const, width: '120px' },
])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.customers') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('customers.title') }}</h1>
      <AppButton @click="openAdd">
        <Plus class="w-4 h-4" /> {{ t('customers.addNew') }}
      </AppButton>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex-1 min-w-[200px] max-w-xs">
        <AppSearchBar v-model="search" />
      </div>
      <select v-model="roleFilter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value="">{{ t('common.all') }} {{ t('common.role') }}</option>
        <option value="CUSTOMER">{{ t('roles.CUSTOMER') }}</option>
        <option value="DRIVER">{{ t('roles.DRIVER') }}</option>
      </select>
      <select v-model="statusFilter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value="">{{ t('common.all') }} {{ t('common.status') }}</option>
        <option value="ACTIVE">{{ t('common.active') }}</option>
        <option value="INACTIVE">{{ t('common.inactive') }}</option>
      </select>
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <AppTable
      v-else
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      row-key="id"
      @sort="toggleSort"
      @row-dbl-click="(row) => router.push(`/admin/customers/${row.id}`)"
    >
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-400">{{ String(value).slice(0, 8) }}</span>
      </template>
      <template #cell-role="{ value }">
        <AppBadge :color="value === 'DRIVER' ? 'secondary' : 'success'">{{ t(`roles.${value}`) }}</AppBadge>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :color="value === 'ACTIVE' ? 'success' : 'danger'">
          {{ value === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
        </AppBadge>
      </template>
      <template #cell-debt_limit="{ value }">
        <span class="font-medium">{{ formatVND(Number(value)) }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button class="p-1.5 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors" @click.stop="router.push(`/admin/customers/${row.id}`)">
            <Eye class="w-4 h-4" />
          </button>
          <button class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" @click.stop="openEdit(row)">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" @click.stop="deleteTarget = row.id">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
      <template #pagination>
        <AppPagination
          :page="page"
          :total-pages="totalPages"
          :total="total"
          :from="(page - 1) * limit"
          :to="page * limit - 1"
          :limit="limit"
          @update:page="page = $event"
          @update:limit="limit = $event; page = 1"
        />
      </template>
    </AppTable>

    <AppDrawer v-model="showDrawer" :title="editingId ? t('customers.editCustomer') : t('customers.addCustomer')" width="max-w-lg">
      <form class="space-y-4" @submit.prevent="saveCustomer">
        <AppInput v-model="form.full_name" :label="t('customers.fullName')" :required="true" :error="formErrors.full_name" />
        <AppInput v-model="form.phone" :label="t('common.phone')" :error="formErrors.phone" placeholder="0901234567" />
        <AppInput v-if="!editingId" v-model="form.email" :label="t('common.email')" type="email" :required="true" :error="formErrors.email" />
        <AppInput v-if="!editingId" v-model="form.password" :label="t('auth.password')" type="password" :required="true" :error="formErrors.password" />
        <AppInput v-model="form.debt_limit" :label="t('customers.debtLimit')" type="number" :min="0" />
        <AppSelect
          v-model="form.status"
          :label="t('common.status')"
          :options="[{ value: 'ACTIVE', label: t('common.active') }, { value: 'INACTIVE', label: t('common.inactive') }]"
        />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showDrawer = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="saveCustomer">{{ t('common.save') }}</AppButton>
      </template>
    </AppDrawer>

    <AppConfirmDialog
      :model-value="!!deleteTarget"
      :title="t('common.delete')"
      :message="t('customers.deleteConfirm')"
      @confirm="deleteCustomer"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
