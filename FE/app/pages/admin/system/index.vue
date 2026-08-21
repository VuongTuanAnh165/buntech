<script setup lang="ts">
import type { SystemConfig } from '~/utils/types'
import { useSystemConfigs } from '~/composables/admin/useSystemConfigs'
import SystemConfigFormDrawer from '~/components/features/admin/system/SystemConfigFormDrawer.vue'
import { t } from '~/utils/i18n'

const { confirm } = useConfirmDialog()
const { fetchConfigs, createConfig, updateConfig, deleteConfig } = useSystemConfigs()

useSeoMeta({ title: `${t('nav_system_config')} - ${t('app_name_admin')}` })
definePageMeta({ layout: 'admin' })

// ─── State ────────────────────────────────────────────────────────
const configs = ref<SystemConfig[]>([])
const search = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const debouncedSearch = refDebounced(search, 300)

watch(debouncedSearch, () => {
  page.value = 1
})

const columns = [
  { accessorKey: 'key', header: t('admin_system_form_key') },
  { accessorKey: 'value', header: t('admin_system_form_val') },
  { accessorKey: 'description', header: t('admin_prod_form_desc') },
  { accessorKey: 'createdAt', header: t('created_at') },
  { accessorKey: 'actions', header: t('actions'), align: 'right' as const, width: '120px' }
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
    title: t('admin_system_delete_title'),
    description: t('admin_system_delete_desc', { key: config.key }),
    confirmLabel: t('delete'),
    cancelLabel: t('common_cancel'),
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
    <BasePageHeader :title="$t('nav_system_config')" :description="$t('admin_system_desc')">
      <template #actions>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd">{{
          $t('admin_system_add')
        }}</UButton>
      </template>
    </BasePageHeader>

    <div class="card p-5">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="max-w-sm flex-1">
          <BaseSearchInput v-model="search" :placeholder="$t('admin_system_search')" />
        </div>
      </div>

      <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
        <BaseDataTable
          :rows="configs"
          :columns="columns"
          :loading="loading"
          :empty-title="$t('admin_system_empty_title')"
          :empty-description="$t('admin_system_empty_desc')"
          empty-icon="i-lucide-settings"
        >
          <template #actions-header>
            <div class="w-full text-right">{{ $t('actions') }}</div>
          </template>

          <template #key-cell="{ row }">
            <span class="text-primary-600 dark:text-primary-400 font-mono text-sm font-medium">
              {{ row.key }}
            </span>
          </template>

          <template #value-cell="{ row }">
            <span class="text-slate-700 dark:text-slate-300">
              {{ row.value }}
            </span>
          </template>

          <template #description-cell="{ row }">
            <span class="text-sm text-slate-500">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-slate-500 dark:text-zinc-400">
              {{ formatDate(row.created_at || new Date()) }}
            </span>
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

          <template #pagination>
            <div
              v-if="total > 0"
              class="border-surface-border flex items-center justify-between border-t px-4 py-3"
            >
              <span class="text-sm text-slate-500 tabular-nums">
                {{ (page - 1) * limit + 1 }}-{{ Math.min(page * limit, total) }} / {{ total }}
              </span>
              <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
            </div>
          </template>
        </BaseDataTable>
      </div>
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
