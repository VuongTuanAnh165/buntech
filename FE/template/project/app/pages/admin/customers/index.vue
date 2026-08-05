<script setup lang="ts">
import {
  Plus, Pencil, Trash2, Eye, Users, UserCheck, UserX, Wallet,
  TrendingUp, Phone, CalendarDays,
} from 'lucide-vue-next'
import { Role, UserStatus, ROLE_COLORS } from '../../../core/enums'
import type { Profile } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatDate, formatNumber } = useFormat()

useHead({ title: `Khách hàng - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── Local reactive data (mock) ───────────────────────────────
const allProfiles = ref<Profile[]>(mockProfiles.filter(p => p.role !== Role.ADMIN))
const loading = ref(true)
const error = ref(false)

// ─── Filters / pagination state ───────────────────────────────
const search = ref('')
const roleFilter = ref<'ALL' | Role>('ALL')
const statusFilter = ref<'ALL' | UserStatus>('ALL')
const sortBy = ref<'full_name' | 'role' | 'status' | 'debt_limit' | 'created_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)

const debouncedSearch = useDebounce(search, 300)

// ─── CRUD state ────────────────────────────────────────────────
const showDrawer = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  full_name: '',
  phone: '',
  email: '',
  password: '',
  role: Role.CUSTOMER,
  debt_limit: 0,
  status: UserStatus.ACTIVE,
})
const formErrors = ref<Record<string, string>>({})
const saving = ref(false)
const deleteTarget = ref<Profile | null>(null)
const deleting = ref(false)

// ─── Simulate loading ──────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── KPI cards ─────────────────────────────────────────────────
const kpiCards = computed(() => {
  const list = allProfiles.value
  const active = list.filter(p => p.status === UserStatus.ACTIVE).length
  const inactive = list.filter(p => p.status === UserStatus.INACTIVE).length
  const totalDebt = list.reduce((s, p) => s + (p.debt_limit || 0), 0)
  return [
    { label: 'Tổng khách hàng', value: formatNumber(list.length), icon: Users, accent: 'bg-gradient-to-r from-primary-500 to-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', trend: '+12%' },
    { label: 'Đang hoạt động', value: formatNumber(active), icon: UserCheck, accent: 'bg-gradient-to-r from-success-500 to-success-400', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', trend: '+5%' },
    { label: 'Tạm khóa', value: formatNumber(inactive), icon: UserX, accent: 'bg-gradient-to-r from-danger-500 to-danger-400', bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-900/30', trend: '-2%' },
    { label: 'Tổng hạn mức nợ', value: formatVND(totalDebt), icon: Wallet, accent: 'bg-gradient-to-r from-accent-500 to-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900/30', trend: '+8%' },
  ]
})

// ─── Filtered + sorted + paginated rows ─────────────────────────
const filteredRows = computed(() => {
  let rows = allProfiles.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    rows = rows.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    )
  }
  if (roleFilter.value !== 'ALL') rows = rows.filter(p => p.role === roleFilter.value)
  if (statusFilter.value !== 'ALL') rows = rows.filter(p => p.status === statusFilter.value)

  const sorted = [...rows].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    switch (sortBy.value) {
      case 'full_name': av = a.full_name; bv = b.full_name; break
      case 'role': av = a.role; bv = b.role; break
      case 'status': av = a.status; bv = b.status; break
      case 'debt_limit': av = a.debt_limit; bv = b.debt_limit; break
      case 'created_at': av = a.created_at; bv = b.created_at; break
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDirection.value === 'asc' ? av - bv : bv - av
    }
    return sortDirection.value === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
  return sorted
})

const total = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})

watch([debouncedSearch, roleFilter, statusFilter], () => { page.value = 1 })

// ─── CRUD handlers ─────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { full_name: '', phone: '', email: '', password: '', role: Role.CUSTOMER, debt_limit: 0, status: UserStatus.ACTIVE }
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
    debt_limit: row.debt_limit,
    status: row.status,
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) formErrors.value.email = 'Email không hợp lệ'
    if (form.value.password.length < 6) formErrors.value.password = 'Mật khẩu tối thiểu 6 ký tự'
  }
  return Object.keys(formErrors.value).length === 0
}

function saveCustomer() {
  if (!validateForm()) return
  saving.value = true
  setTimeout(() => {
    if (editingId.value) {
      const idx = allProfiles.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) {
        allProfiles.value[idx] = {
          ...allProfiles.value[idx],
          full_name: form.value.full_name,
          phone: form.value.phone,
          role: form.value.role,
          debt_limit: form.value.debt_limit,
          status: form.value.status,
          updated_at: new Date().toISOString(),
        }
      }
      toast.success('Cập nhật khách hàng thành công')
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
        updated_at: new Date().toISOString(),
      }
      allProfiles.value.unshift(newProfile)
      toast.success('Thêm khách hàng thành công')
    }
    saving.value = false
    showDrawer.value = false
  }, 400)
}

function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    allProfiles.value = allProfiles.value.filter(p => p.id !== deleteTarget.value?.id)
    toast.success('Xóa khách hàng thành công')
    deleteTarget.value = null
    deleting.value = false
    if (pagedRows.value.length === 0 && page.value > 1) page.value--
  }, 400)
}

function toggleSort(col: 'full_name' | 'role' | 'status' | 'debt_limit' | 'created_at') {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}

const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa khách hàng "${deleteTarget.value.full_name}"? Hành động này không thể hoàn tác.`
    : ''
)

const columns = computed(() => [
  { key: 'full_name', label: 'Khách hàng', sortable: true },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'role', label: 'Vai trò', sortable: true },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'debt_limit', label: 'Hạn mức nợ', align: 'right' as const, sortable: true },
  { key: 'created_at', label: 'Ngày tạo', sortable: true, hideOnMobile: true },
  { key: 'actions', label: 'Thao tác', align: 'right' as const, width: '120px', hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Khách hàng" subtitle="Quản lý thông tin khách hàng, tài xế và hạn mức nợ" breadcrumb-label="Khách hàng">
      <template #actions>
        <AppButton @click="openAdd">
          <Plus class="w-4 h-4" aria-hidden="true" /> Thêm khách hàng
        </AppButton>
      </template>
    </AppPageHeader>

    <AppErrorState v-if="error" message="Không thể tải danh sách khách hàng." @retry="loading = true; error = false" />

    <template v-else>
      <!-- KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="card p-5">
            <div class="flex items-center gap-3 mb-3">
              <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
              <div class="flex-1"><AppSkeleton height="h-3" width="w-16" /></div>
            </div>
            <AppSkeleton height="h-3" class="mb-2" />
            <AppSkeleton height="h-6" width="w-2/3" />
          </div>
        </template>
        <template v-else>
          <div
            v-for="(card, i) in kpiCards"
            :key="card.label"
            class="card card-hover p-5 stagger-item relative overflow-hidden group"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <div :class="['kpi-accent', card.accent]" />
            <div class="flex items-start justify-between mb-2.5">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', card.bg, card.ring]">
                <component :is="card.icon" :class="['w-5 h-5', card.text]" aria-hidden="true" />
              </div>
              <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                <TrendingUp class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Toolbar -->
      <AppToolbar>
        <template #search>
          <AppSearchBar v-model="search" placeholder="Tìm theo tên hoặc số điện thoại..." />
        </template>
        <AppSelect
          v-model="roleFilter"
          :options="[
            { value: 'ALL', label: 'Tất cả vai trò' },
            { value: Role.CUSTOMER, label: 'Khách hàng' },
            { value: Role.DRIVER, label: 'Tài xế' },
          ]"
        />
        <AppSelect
          v-model="statusFilter"
          :options="[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: UserStatus.ACTIVE, label: 'Đang hoạt động' },
            { value: UserStatus.INACTIVE, label: 'Tạm khóa' },
          ]"
        />
      </AppToolbar>

      <!-- Table -->
      <div class="animate-fade-in-up" style="animation-delay: 100ms">
        <AppTable
          :columns="columns"
          :rows="pagedRows as unknown as Record<string, unknown>[]"
          :loading="loading"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          row-key="id"
          empty-title="Không tìm thấy khách hàng"
          empty-description="Thử đổi bộ lọc hoặc thêm khách hàng mới."
          @sort="toggleSort"
          @row-dbl-click="(row) => router.push(`/admin/customers/${row.id}`)"
        >
          <template #cell-full_name="{ row }">
            <div class="flex items-center gap-3 min-w-0">
              <AppAvatar :name="(row as Profile).full_name" :src="(row as Profile).avatar_url || undefined" size="sm" />
              <div class="min-w-0">
                <p class="font-medium text-surface-foreground truncate max-w-[220px]">{{ (row as Profile).full_name }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate">{{ (row as Profile).id.slice(0, 12) }}</p>
              </div>
            </div>
          </template>

          <template #cell-phone="{ value }">
            <span v-if="value" class="flex items-center gap-1.5 text-surface-foreground tabular-nums">
              <Phone class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" /> {{ value }}
            </span>
            <span v-else class="text-slate-400 dark:text-zinc-500">—</span>
          </template>

          <template #cell-role="{ value }">
            <AppBadge :color="ROLE_COLORS[value as Role]" variant="soft">
              {{ value === Role.DRIVER ? 'Tài xế' : 'Khách hàng' }}
            </AppBadge>
          </template>

          <template #cell-status="{ value }">
            <AppBadge :color="value === UserStatus.ACTIVE ? 'success' : 'danger'" :dot="true">
              {{ value === UserStatus.ACTIVE ? 'Đang hoạt động' : 'Tạm khóa' }}
            </AppBadge>
          </template>

          <template #cell-debt_limit="{ value }">
            <span :class="['font-medium tabular-nums', Number(value) > 0 ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400 dark:text-zinc-500']">
              {{ Number(value) > 0 ? formatVND(Number(value)) : '—' }}
            </span>
          </template>

          <template #cell-created_at="{ value }">
            <span class="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
              <CalendarDays class="w-3.5 h-3.5" aria-hidden="true" /> {{ formatDate(value as string) }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1" @click.stop>
              <AppIconButton :icon="Eye" label="Xem" variant="view" @click.stop="router.push(`/admin/customers/${(row as Profile).id}`)" />
              <AppIconButton :icon="Pencil" label="Sửa" variant="edit" @click.stop="openEdit(row as Profile)" />
              <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click.stop="deleteTarget = row as Profile" />
            </div>
          </template>

          <!-- Mobile card layout -->
          <template #mobile-row="{ row }">
            <div class="flex gap-3">
              <AppAvatar :name="(row as Profile).full_name" :src="(row as Profile).avatar_url || undefined" size="md" />
              <div class="flex-1 min-w-0 space-y-1.5">
                <p class="font-medium text-surface-foreground line-clamp-1">{{ (row as Profile).full_name }}</p>
                <div class="flex items-center gap-2 flex-wrap">
                  <AppBadge :color="ROLE_COLORS[(row as Profile).role]" variant="soft">
                    {{ (row as Profile).role === Role.DRIVER ? 'Tài xế' : 'Khách hàng' }}
                  </AppBadge>
                  <AppBadge :color="(row as Profile).status === UserStatus.ACTIVE ? 'success' : 'danger'" :dot="true">
                    {{ (row as Profile).status === UserStatus.ACTIVE ? 'Hoạt động' : 'Tạm khóa' }}
                  </AppBadge>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ (row as Profile).phone || '—' }}</p>
              </div>
              <div class="flex flex-col gap-1 flex-shrink-0">
                <AppIconButton :icon="Pencil" label="Sửa" variant="edit" @click.stop="openEdit(row as Profile)" />
                <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click.stop="deleteTarget = row as Profile" />
              </div>
            </div>
          </template>

          <template #pagination>
            <AppPagination
              :page="page"
              :total-pages="totalPages"
              :total="total"
              :from="total === 0 ? 0 : (page - 1) * limit + 1"
              :to="Math.min(page * limit, total)"
              :limit="limit"
              @update:page="page = $event"
              @update:limit="limit = $event; page = 1"
            />
          </template>
        </AppTable>
      </div>
    </template>

    <!-- Add/Edit Drawer -->
    <AppDrawer v-model="showDrawer" :title="editingId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'" width="max-w-lg">
      <form class="space-y-4" @submit.prevent="saveCustomer">
        <AppInput v-model="form.full_name" label="Họ và tên" :required="true" :error="formErrors.full_name" placeholder="Nguyễn Văn A" />
        <AppInput v-model="form.phone" label="Số điện thoại" :error="formErrors.phone" placeholder="0901234567" />
        <AppSelect
          v-model="form.role"
          label="Vai trò"
          :options="[
            { value: Role.CUSTOMER, label: 'Khách hàng' },
            { value: Role.DRIVER, label: 'Tài xế' },
          ]"
        />
        <template v-if="!editingId">
          <AppInput v-model="form.email" label="Email" type="email" :required="true" :error="formErrors.email" placeholder="email@example.com" />
          <AppInput v-model="form.password" label="Mật khẩu" type="password" :required="true" :error="formErrors.password" placeholder="Tối thiểu 6 ký tự" />
        </template>
        <AppInput v-model="form.debt_limit" label="Hạn mức nợ (VND)" type="number" :min="0" :step="100000" />
        <AppSelect
          v-model="form.status"
          label="Trạng thái"
          :options="[
            { value: UserStatus.ACTIVE, label: 'Đang hoạt động' },
            { value: UserStatus.INACTIVE, label: 'Tạm khóa' },
          ]"
        />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showDrawer = false">Hủy</AppButton>
        <AppButton :loading="saving" @click="saveCustomer">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</AppButton>
      </template>
    </AppDrawer>

    <AppConfirmDialog
      :model-value="!!deleteTarget"
      title="Xóa khách hàng"
      :message="deleteConfirmMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
