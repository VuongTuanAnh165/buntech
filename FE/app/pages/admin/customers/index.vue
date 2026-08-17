<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { ConstantKey } from '~/enums/constantKeys'
import CustomerFormDrawer from '~/components/features/admin/customers/CustomerFormDrawer.vue'
import { useUsers } from '~/composables/admin/useUsers'
import type { UserDTO } from '~/utils/types'

useSeoMeta({ title: 'Khách hàng - BunTech Admin' })
definePageMeta({ layout: 'admin' })

const { constants } = useMasterData()
const toast = useToast()
const { fetchUsers, deleteUser } = useUsers()
const { confirm } = useConfirmDialog()

const roleFilter = ref<string>('ALL')

const { page, limit, total, search } = usePagination(10)

useSyncQuery({
  search,
  page,
  limit,
  roleFilter
})

const debouncedSearch = refDebounced(search, 300)

const roleOptions = computed(() => [
  { label: 'Tất cả vai trò', value: 'ALL' },
  { label: 'Khách hàng', value: constants.value?.[ConstantKey.Role]?.CUSTOMER || 'CUSTOMER' },
  { label: 'Tài xế', value: constants.value?.[ConstantKey.Role]?.DRIVER || 'DRIVER' },
  { label: 'Quản trị viên', value: constants.value?.[ConstantKey.Role]?.ADMIN || 'ADMIN' }
])

const fetchParams = computed(() => {
  const params: Record<string, unknown> = {
    page: page.value,
    limit: limit.value
  }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (roleFilter.value !== 'ALL') params.role = roleFilter.value
  return params
})

const {
  data: usersData,
  status,
  refresh,
  error
} = useAsyncData('admin-users-list', () => fetchUsers(fetchParams.value), { watch: [fetchParams] })

const loading = computed(() => status.value === 'pending')
const usersList = computed(() => usersData.value?.data?.data || [])
watch(
  () => usersData.value?.data?.meta?.total,
  (newTotal) => {
    total.value = newTotal || 0
  },
  { immediate: true }
)

const kpiCards = computed(() => {
  const t = total.value
  return [
    {
      title: 'Tổng người dùng',
      value: t,
      icon: 'i-lucide-users',
      color: 'primary' as const,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Khách hàng',
      value: usersList.value.filter(
        (u: UserDTO) => u.role === (constants.value?.[ConstantKey.Role]?.CUSTOMER || 'CUSTOMER')
      ).length,
      icon: 'i-lucide-user',
      color: 'success' as const,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Nhân sự',
      value: usersList.value.filter(
        (u: UserDTO) =>
          u.role === (constants.value?.[ConstantKey.Role]?.DRIVER || 'DRIVER') ||
          u.role === (constants.value?.[ConstantKey.Role]?.ADMIN || 'ADMIN')
      ).length,
      icon: 'i-lucide-briefcase',
      color: 'warning' as const,
      trend: { value: 0, isPositive: true }
    }
  ]
})

const columns = [
  { accessorKey: 'fullName', header: 'Khách hàng' },
  { accessorKey: 'phoneNumber', header: 'Điện thoại' },
  { accessorKey: 'role', header: 'Vai trò' },
  { accessorKey: 'debtLimit', header: 'Hạn mức nợ' },
  { accessorKey: 'createdAt', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Thao tác' }
]

// Drawer logic
const showDrawer = ref(false)
const editingUser = ref<UserDTO | null>(null)

const openAdd = () => {
  editingUser.value = null
  showDrawer.value = true
}

const openEdit = (row: UserDTO) => {
  editingUser.value = { ...row }
  showDrawer.value = true
}

const handleDelete = async (row: UserDTO) => {
  const confirmed = await confirm({
    title: 'Xóa khách hàng',
    description: `Bạn có chắc muốn xóa "${row.fullName}"? Hành động này không thể hoàn tác.`,
    confirmLabel: 'Xóa',
    color: 'error'
  })

  if (confirmed) {
    try {
      await deleteUser(row.id)
      toast.add({ title: 'Xóa thành công', color: 'success' })
      refresh()
    } catch {
      // API error intercepted globally
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader
      title="Khách hàng & Người dùng"
      subtitle="Quản lý thông tin khách hàng, tài xế và các người dùng khác"
    >
      <template #action>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd">Thêm mới</UButton>
      </template>
    </BasePageHeader>

    <BaseEmptyState
      v-if="error"
      icon="i-lucide-alert-circle"
      title="Lỗi tải dữ liệu"
      description="Không thể tải danh sách người dùng."
    >
      <template #action>
        <UButton color="primary" @click="refresh()">Thử lại</UButton>
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
            :items="roleOptions"
            value-key="value"
            label-key="label"
            class="sm:w-48"
          >
            <template #default>{{
              roleOptions.find((o) => o.value === roleFilter)?.label
            }}</template>
          </USelectMenu>
        </div>

        <div class="animate-fade-in-up" style="animation-delay: 100ms">
          <BaseDataTable
            :columns="columns"
            :rows="usersList as any[]"
            :loading="loading"
            empty-title="Không tìm thấy người dùng"
            empty-description="Thử đổi bộ lọc hoặc thêm mới."
          >
            <template #fullName-cell="{ row }">
              <div
                class="flex min-w-0 cursor-pointer items-center gap-3"
                @dblclick="
                  () => {
                    navigateTo(`/admin/customers/${(row as UserDTO).id}`)
                  }
                "
              >
                <UAvatar
                  :alt="(row as UserDTO).fullName as string"
                  :src="((row as UserDTO).profile?.avatarUrl as string) || undefined"
                  size="sm"
                />
                <div class="min-w-0">
                  <p class="text-surface-foreground max-w-[220px] truncate font-medium">
                    {{ (row as UserDTO).fullName }}
                  </p>
                  <p class="truncate font-mono text-xs text-slate-500 dark:text-zinc-400">
                    {{ String((row as UserDTO).id).slice(0, 12) }}
                  </p>
                </div>
              </div>
            </template>
            <template #phoneNumber-cell="{ row }">
              <span
                v-if="(row as UserDTO).phoneNumber"
                class="text-surface-foreground flex items-center gap-1.5 tabular-nums"
              >
                <span class="i-lucide-phone h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {{ (row as UserDTO).phoneNumber }}
              </span>
              <span v-else class="text-slate-400 dark:text-zinc-500">—</span>
            </template>
            <template #role-cell="{ row }">
              <UBadge
                :color="
                  (row as UserDTO).role === 'DRIVER'
                    ? 'warning'
                    : (row as UserDTO).role === 'ADMIN'
                      ? 'error'
                      : 'primary'
                "
                variant="soft"
              >
                {{
                  roleOptions.find((o) => o.value === (row as UserDTO).role)?.label ||
                  (row as UserDTO).role
                }}
              </UBadge>
            </template>
            <template #debtLimit-cell="{ row }">
              <span
                :class="[
                  'font-medium tabular-nums',
                  Number((row as UserDTO).profile?.debtLimit) > 0
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-slate-400 dark:text-zinc-500'
                ]"
              >
                {{
                  Number((row as UserDTO).profile?.debtLimit) > 0
                    ? formatVND(Number((row as UserDTO).profile?.debtLimit))
                    : '—'
                }}
              </span>
            </template>
            <template #createdAt-cell="{ row }">
              <span class="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <span class="i-lucide-calendar-days h-3.5 w-3.5" aria-hidden="true" />
                {{ formatDate((row as UserDTO).createdAt || new Date()) }}
              </span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end gap-1" @click.stop>
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  aria-label="Xem chi tiết"
                  @click.stop="
                    () => {
                      navigateTo(`/admin/customers/${(row as UserDTO).id}`)
                    }
                  "
                />
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  aria-label="Chỉnh sửa"
                  @click.stop="
                    () => {
                      openEdit(row as UserDTO)
                    }
                  "
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  aria-label="Xóa"
                  @click.stop="
                    () => {
                      handleDelete(row as UserDTO)
                    }
                  "
                />
              </div>
            </template>
            <template #pagination>
              <div
                class="border-surface-border mt-4 flex items-center justify-between border-t py-2"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm text-slate-500 dark:text-zinc-400">
                    {{ total === 0 ? 0 : Math.min((page - 1) * limit + 1, total) }}-{{
                      Math.min(page * limit, total)
                    }}
                    / {{ total }}
                  </span>
                  <USelectMenu v-model="limit" :items="[10, 20, 50]" class="w-32">
                    <template #default>{{ limit }} / trang</template>
                  </USelectMenu>
                </div>
                <UPagination v-model="page" :total="total" :page-count="limit" :max="5" />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </UCard>
    </template>

    <CustomerFormDrawer v-model:open="showDrawer" :user="editingUser" @refresh="refresh" />
  </div>
</template>
