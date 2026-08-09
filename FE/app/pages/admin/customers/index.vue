<script setup lang="ts">
import { Role, UserStatus, mockProfiles } from '~/utils/mockData'
import type { Profile } from '~/utils/mockData'

useSeoMeta({ title: 'Khách hàng - BunTech Admin' })
definePageMeta({ layout: 'admin' })
const toast = useToast()
// State
const allProfiles = ref<Profile[]>(mockProfiles.filter((p) => p.role !== Role.ADMIN))
const loading = ref(true)
const error = ref(false)
// Filters
const search = ref('')
const roleFilter = ref<string>('ALL')
const statusFilter = ref<string>('ALL')
const page = ref(1)
const limit = ref(10)
const roleOptions = [
  { label: 'Tất cả vai trò', value: 'ALL' },
  { label: 'Khách hàng', value: Role.CUSTOMER },
  { label: 'Tài xế', value: Role.DRIVER }
]
const statusOptions = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đang hoạt động', value: UserStatus.ACTIVE },
  { label: 'Tạm khóa', value: UserStatus.INACTIVE }
]
// Debounce for search
const debouncedSearch = ref('')
const searchTimeoutId = ref<ReturnType<typeof setTimeout>>()
watch(search, (val) => {
  clearTimeout(searchTimeoutId.value)
  searchTimeoutId.value = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})
// KPI
const kpiCards = computed(() => {
  const list = allProfiles.value
  const active = list.filter((p) => p.status === UserStatus.ACTIVE).length
  const inactive = list.filter((p) => p.status === UserStatus.INACTIVE).length
  const _totalDebt = list.reduce((s, p) => s + (p.debt_limit || 0), 0)
  return [
    {
      title: 'Tổng khách hàng',
      value: list.length,
      icon: 'i-lucide-users',
      color: 'primary',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Đang hoạt động',
      value: active,
      icon: 'i-lucide-user-check',
      color: 'success',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Tạm khóa',
      value: inactive,
      icon: 'i-lucide-user-x',
      color: 'error',
      trend: { value: 2, isPositive: false }
    }
  ]
})
// Data Table
const filteredRows = computed(() => {
  let rows = allProfiles.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    rows = rows.filter((p) => p.full_name.toLowerCase().includes(q) || (p.phone || '').includes(q))
  }
  if (roleFilter.value !== 'ALL') rows = rows.filter((p) => p.role === roleFilter.value)
  if (statusFilter.value !== 'ALL') rows = rows.filter((p) => p.status === statusFilter.value)
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
const total = computed(() => filteredRows.value.length)
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})
watch([debouncedSearch, roleFilter, statusFilter], () => {
  page.value = 1
})
// Columns
const columns = [
  { accessorKey: 'full_name', header: 'Khách hàng' },
  { accessorKey: 'phone', header: 'Điện thoại' },
  { accessorKey: 'role', header: 'Vai trò' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'debt_limit', header: 'Hạn mức nợ' },
  { accessorKey: 'created_at', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Thao tác' }
]
// CRUD
const showDrawer = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  full_name: '',
  phone: '',
  email: '',
  password: '',
  role: Role.CUSTOMER,
  debt_limit: 0,
  status: UserStatus.ACTIVE
})
const formErrors = ref<Record<string, string>>({})
const saving = ref(false)
const deleteTarget = ref<Profile | null>(null)
const deleting = ref(false)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
function openAdd() {
  editingId.value = null
  form.value = {
    full_name: '',
    phone: '',
    email: '',
    password: '',
    role: Role.CUSTOMER,
    debt_limit: 0,
    status: UserStatus.ACTIVE
  }
  formErrors.value = {}
  showDrawer.value = true
}
function openEdit(row: Profile) {
  editingId.value = row.id
  form.value = {
    full_name: row.full_name,
    phone: row.phone || '',
    email: '',
    password: '',
    role: row.role,
    debt_limit: row.debt_limit || 0,
    status: row.status
  }
  formErrors.value = {}
  showDrawer.value = true
}
function validateForm() {
  formErrors.value = {}
  if (!form.value.full_name.trim()) formErrors.value.full_name = 'Vui lòng nhập họ tên'
  if (form.value.phone && !/^(0[0-9]{9,10})$/.test(form.value.phone)) {
    formErrors.value.phone = 'Số điện thoại không hợp lệ'
  }
  if (!editingId.value) {
    if (!form.value.email.trim()) formErrors.value.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
      formErrors.value.email = 'Email không hợp lệ'
    if (form.value.password.length < 6) formErrors.value.password = 'Mật khẩu tối thiểu 6 ký tự'
  }
  return Object.keys(formErrors.value).length === 0
}
function saveCustomer() {
  if (!validateForm()) return
  saving.value = true
  setTimeout(() => {
    if (editingId.value) {
      const idx = allProfiles.value.findIndex((p) => p.id === editingId.value)
      if (idx !== -1) {
        allProfiles.value[idx] = {
          ...allProfiles.value[idx],
          full_name: form.value.full_name,
          phone: form.value.phone,
          role: form.value.role,
          debt_limit: form.value.debt_limit,
          status: form.value.status,
          updated_at: new Date().toISOString()
        }
      }
      toast.add({ title: 'Cập nhật khách hàng thành công', color: 'success' })
    } else {
      const newId = `usr-new-${Date.now()}`
      const newProfile: Profile = {
        id: newId,
        role: form.value.role,
        phone: form.value.phone,
        full_name: form.value.full_name,
        status: form.value.status,
        debt_limit: form.value.debt_limit,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.value.full_name)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      allProfiles.value.unshift(newProfile)
      toast.add({ title: 'Thêm khách hàng thành công', color: 'success' })
    }
    saving.value = false
    showDrawer.value = false
  }, 400)
}
function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    allProfiles.value = allProfiles.value.filter((p) => p.id !== deleteTarget.value?.id)
    toast.add({ title: 'Xóa khách hàng thành công', color: 'success' })
    deleteTarget.value = null
    deleting.value = false
    if (pagedRows.value.length === 0 && page.value > 1) page.value--
  }, 400)
}
const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa khách hàng "${deleteTarget.value.full_name}"? Hành động này không thể hoàn tác.`
    : ''
)
</script>
<template>
  <div class="space-y-6">
    <BasePageHeader
      title="Khách hàng"
      subtitle="Quản lý thông tin khách hàng, tài xế và hạn mức nợ"
    >
      <template #action>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd"> Thêm khách hàng </UButton>
      </template>
    </BasePageHeader>
    <BaseEmptyState
      v-if="error"
      icon="i-lucide-alert-circle"
      title="Lỗi tải dữ liệu"
      description="Không thể tải danh sách khách hàng."
    >
      <template #action>
        <UButton
          color="primary"
          @click="
            loading = true
            error = false
            setTimeout(() => (loading = false), 300)
          "
          >Thử lại</UButton
        >
      </template>
    </BaseEmptyState>
    <template v-else>
      <BaseStatsGrid :stats="kpiCards" :loading="loading" />
      <UCard>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row">
          <BaseSearchInput
            v-model="search"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            class="sm:w-80"
          />
          <USelectMenu
            v-model="roleFilter"
            :options="roleOptions"
            value-key="value"
            label-key="label"
            class="sm:w-48"
          >
            <template #label>{{ roleOptions.find((o) => o.value === roleFilter)?.label }}</template>
          </USelectMenu>
          <USelectMenu
            v-model="statusFilter"
            :options="statusOptions"
            value-key="value"
            label-key="label"
            class="sm:w-48"
          >
            <template #label>{{
              statusOptions.find((o) => o.value === statusFilter)?.label
            }}</template>
          </USelectMenu>
        </div>
        <div class="animate-fade-in-up" style="animation-delay: 100ms">
          <BaseDataTable
            :columns="columns"
            :rows="pagedRows"
            :loading="loading"
            empty-title="Không tìm thấy khách hàng"
            empty-description="Thử đổi bộ lọc hoặc thêm khách hàng mới."
          >
            <template #full_name-cell="{ row }">
              <div
                class="flex min-w-0 items-center gap-3"
                @dblclick="navigateTo(`/admin/customers/${row.id}`)"
              >
                <UAvatar :alt="row.full_name" :src="row.avatar_url || undefined" size="sm" />
                <div class="min-w-0">
                  <p class="text-surface-foreground max-w-[220px] truncate font-medium">
                    {{ row.full_name }}
                  </p>
                  <p class="truncate font-mono text-xs text-slate-500 dark:text-zinc-400">
                    {{ row.id.slice(0, 12) }}
                  </p>
                </div>
              </div>
            </template>
            <template #phone-cell="{ row }">
              <span
                v-if="row.phone"
                class="text-surface-foreground flex items-center gap-1.5 tabular-nums"
              >
                <span class="i-lucide-phone h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {{ row.phone }}
              </span>
              <span v-else class="text-slate-400 dark:text-zinc-500">—</span>
            </template>
            <template #role-cell="{ row }">
              <UBadge :color="row.role === Role.DRIVER ? 'warning' : 'primary'" variant="soft">
                {{ row.role === Role.DRIVER ? 'Tài xế' : 'Khách hàng' }}
              </UBadge>
            </template>
            <template #status-cell="{ row }">
              <BaseStatusBadge type="user" :status="row.status" />
            </template>
            <template #debt_limit-cell="{ row }">
              <span
                :class="[
                  'font-medium tabular-nums',
                  Number(row.debt_limit) > 0
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-slate-400 dark:text-zinc-500'
                ]"
              >
                {{ Number(row.debt_limit) > 0 ? formatVND(Number(row.debt_limit)) : '—' }}
              </span>
            </template>
            <template #created_at-cell="{ row }">
              <span class="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <span class="i-lucide-calendar-days h-3.5 w-3.5" aria-hidden="true" />
                {{ formatDate(row.created_at) }}
              </span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end gap-1" @click.stop>
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  aria-label="Xem chi tiết"
                  @click.stop="navigateTo(`/admin/customers/${row.id}`)"
                />
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  aria-label="Chỉnh sửa"
                  @click.stop="openEdit(row)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  aria-label="Xóa"
                  @click.stop="deleteTarget = row"
                />
              </div>
            </template>
            <template #pagination>
              <div
                class="border-surface-border mt-4 flex items-center justify-between border-t py-2"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm text-slate-500 dark:text-zinc-400">
                    {{ Math.min((page - 1) * limit + 1, total) }}-{{
                      Math.min(page * limit, total)
                    }}
                    / {{ total }}
                  </span>
                  <USelectMenu v-model="limit" :options="[10, 20, 50]" class="w-32">
                    <template #label>{{ limit }} / trang</template>
                  </USelectMenu>
                </div>
                <UPagination v-model="page" :total="total" :page-count="limit" :max="5" />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </UCard>
    </template>
    <USlideover
      v-model:open="showDrawer"
      :title="editingId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'"
      description="Điền thông tin bên dưới để lưu."
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Họ và tên" required :error="formErrors.full_name">
            <UInput v-model="form.full_name" placeholder="Nguyễn Văn A" class="w-full" />
          </UFormField>
          <UFormField label="Số điện thoại" :error="formErrors.phone">
            <UInput v-model="form.phone" placeholder="0901234567" class="w-full" />
          </UFormField>
          <UFormField label="Vai trò">
            <USelectMenu
              v-model="form.role"
              :options="roleOptions.filter((o) => o.value !== 'ALL')"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>
          <template v-if="!editingId">
            <UFormField label="Email" required :error="formErrors.email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Mật khẩu" required :error="formErrors.password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                class="w-full"
              />
            </UFormField>
          </template>
          <UFormField label="Hạn mức nợ (VND)">
            <UInput
              v-model="form.debt_limit"
              type="number"
              :min="0"
              :step="100000"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Trạng thái">
            <USelectMenu
              v-model="form.status"
              :options="statusOptions.filter((o) => o.value !== 'ALL')"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="showDrawer = false">Hủy</UButton>
          <UButton :loading="saving" color="primary" @click="saveCustomer">{{
            editingId ? 'Cập nhật' : 'Thêm mới'
          }}</UButton>
        </div>
      </template>
    </USlideover>
    <BaseConfirmDialog
      :open="!!deleteTarget"
      title="Xóa khách hàng"
      :description="deleteConfirmMessage"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
      @update:open="!$event && (deleteTarget = null)"
    />
  </div>
</template>
