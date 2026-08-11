<script setup lang="ts">
import type { SystemConfig } from '~/utils/types'
import { useSystemConfigs } from '~/composables/admin/useSystemConfigs'
import SystemConfigFormDrawer from '~/components/features/admin/system/SystemConfigFormDrawer.vue'

const { confirm } = useConfirmDialog()
const { fetchConfigs, createConfig, updateConfig, deleteConfig } = useSystemConfigs()

useSeoMeta({ title: 'Cấu hình hệ thống - BunTech Admin' })
definePageMeta({ layout: 'admin' })

// ─── State ────────────────────────────────────────────────────────
const configs = ref<SystemConfig[]>([])
const search = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const debouncedSearch = ref('')
const searchTimeoutId = ref<ReturnType<typeof setTimeout>>()

watch(search, (val) => {
  clearTimeout(searchTimeoutId.value)
  searchTimeoutId.value = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 1
  }, 300)
})

const columns = [
  { accessorKey: 'key', header: 'Key' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'description', header: 'Mô tả' },
  { accessorKey: 'createdAt', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Thao tác', align: 'right' as const, width: '120px' }
]

// ─── Data fetching ────────────────────────────────────────────────
const {
  data: resData,
  status,
  refresh
} = await useAsyncData(
  'admin-system-configs',
  () =>
    fetchConfigs({
      page: page.value,
      limit: limit.value,
      search: debouncedSearch.value || undefined
    }),
  {
    watch: [page, limit, debouncedSearch]
  }
)

const loading = computed(() => status.value === 'pending')

watchEffect(() => {
  if (resData.value?.data) {
    configs.value = (resData.value.data as unknown as { data: SystemConfig[] }).data || []
    total.value = (resData.value.data as unknown as { meta?: { total: number } }).meta?.total || 0
  }
})

async function loadData() {
  await refresh()
}

onUnmounted(() => {
  if (searchTimeoutId.value) clearTimeout(searchTimeoutId.value)
})

// ─── CRUD ────────────────────────────────────────────────────────
const showDrawer = ref(false)
const targetConfig = ref<SystemConfig | null>(null)

function openAdd() {
  targetConfig.value = null
  showDrawer.value = true
}

function openEdit(row: unknown) {
  targetConfig.value = { ...(row as SystemConfig) }
  showDrawer.value = true
}

const saving = ref(false)

async function handleSave(data: { key: string; value: string; description?: string }) {
  saving.value = true
  try {
    if (targetConfig.value) {
      await updateConfig(targetConfig.value.key, {
        value: data.value,
        description: data.description
      })
    } else {
      await createConfig(data)
      page.value = 1
      search.value = ''
    }
    showDrawer.value = false
    await loadData()
  } catch {
    // Interceptor sẽ lo thông báo lỗi
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: unknown) {
  const config = row as SystemConfig
  const isConfirmed = await confirm({
    title: 'Xóa cấu hình',
    description: `Bạn có chắc chắn muốn xóa cấu hình "${config.key}"? Việc này có thể ảnh hưởng đến hệ thống.`,
    confirmLabel: 'Xóa',
    cancelLabel: 'Hủy',
    color: 'error'
  })

  if (isConfirmed) {
    try {
      await deleteConfig(config.key)
      if (configs.value.length === 1 && page.value > 1) {
        page.value--
      } else {
        loadData()
      }
    } catch {
      // Interceptor xử lý lỗi
    }
  }
}
</script>

<template>
  <div class="pb-10">
    <BasePageHeader
      title="Cấu hình hệ thống"
      description="Quản lý các biến cấu hình động (Ship, Liên hệ, System...)"
    >
      <template #actions>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd">Thêm cấu hình</UButton>
      </template>
    </BasePageHeader>

    <div
      class="bg-surface ring-surface-border flex flex-col items-center gap-3 rounded-t-xl p-3 ring-1 sm:flex-row"
    >
      <BaseSearchInput
        v-model="search"
        placeholder="Tìm kiếm cấu hình..."
        class="w-full max-w-sm flex-1"
      />
    </div>

    <UTable
      :data="configs"
      :columns="columns"
      :loading="loading"
      class="bg-surface ring-surface-border min-h-[400px] rounded-b-xl ring-1"
    >
      <template #empty>
        <BaseEmptyState
          title="Chưa có cấu hình nào"
          description="Hệ thống chưa có cấu hình động nào. Hãy tạo cấu hình mới."
          icon="i-lucide-settings"
        >
          <UButton color="primary" @click="openAdd">Thêm cấu hình</UButton>
        </BaseEmptyState>
      </template>

      <template #actions-header>
        <div class="w-full text-right">Thao tác</div>
      </template>

      <template #key-cell="{ row }">
        <span class="text-primary-600 dark:text-primary-400 font-mono text-sm font-medium">
          {{ row.original.key }}
        </span>
      </template>

      <template #value-cell="{ row }">
        <span class="text-slate-700 dark:text-slate-300">
          {{ row.original.value }}
        </span>
      </template>

      <template #description-cell="{ row }">
        <span class="text-sm text-slate-500">
          {{ row.original.description || '-' }}
        </span>
      </template>

      <template #created_at-cell="{ row }">
        <span class="text-slate-500 dark:text-zinc-400">
          {{ formatDate(row.original.created_at || new Date()) }}
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
              @click="openEdit(row.original)"
            />
          </UTooltip>
          <UTooltip text="Xóa">
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              @click="handleDelete(row.original)"
            />
          </UTooltip>
        </div>
      </template>
    </UTable>

    <!-- Pagination -->
    <div v-if="total > 0" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-slate-500">
        Hiển thị {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }} trong tổng số
        {{ total }}
      </div>
      <UPagination v-model="page" :total="total" :page-count="limit" />
    </div>

    <!-- Tường minh Drawer để đảm bảo luôn load được -->
    <SystemConfigFormDrawer
      v-model:open="showDrawer"
      :config="targetConfig"
      :loading="saving"
      @save="handleSave"
    />
  </div>
</template>
