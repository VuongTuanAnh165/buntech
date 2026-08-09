<script setup lang="ts">
import { mockInventoryItems, mockInventoryMovements } from '~/utils/mockData'
import { InventoryMovementType } from '~/utils/enums'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Kho nguyên liệu - BunTech Admin' })
const toast = useToast()
// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const showAddModal = ref(false)
const editItem = ref<(typeof mockInventoryItems)[0] | null>(null)
const newItemName = ref('')
const newItemUnit = ref('')
const newItemQty = ref<number>(0)
// ─── Computed KPIs ────────────────────────────────────────
const totalItems = computed(() => mockInventoryItems.length)
const totalQuantity = computed(() => mockInventoryItems.reduce((s, i) => s + i.quantity, 0))
const lowStockItems = computed(() => mockInventoryItems.filter((i) => i.quantity <= 50).length)
const monthMovements = computed(() => {
  const now = Date.now()
  const thirtyDays = 30 * 86400000
  return mockInventoryMovements.filter((m) => now - new Date(m.created_at).getTime() < thirtyDays)
    .length
})
const kpiStats = computed(() => [
  {
    title: 'Tổng nguyên liệu',
    value: formatNumber(totalItems.value),
    icon: 'i-lucide-package',
    color: 'primary' as const,
    trend: { value: 2, isPositive: true }
  },
  {
    title: 'Tổng số lượng',
    value: formatNumber(totalQuantity.value),
    icon: 'i-lucide-layers',
    color: 'success' as const,
    trend: { value: 8.4, isPositive: true }
  },
  {
    title: 'Sắp hết hàng',
    value: String(lowStockItems.value),
    icon: 'i-lucide-alert-triangle',
    color: 'warning' as const
  },
  {
    title: 'Giao dịch tháng này',
    value: formatNumber(monthMovements.value),
    icon: 'i-lucide-repeat',
    color: 'info' as const,
    trend: { value: 15, isPositive: true }
  }
])
// ─── Filtered items ───────────────────────────────────────
const filteredItems = computed(() => {
  if (!search.value.trim()) return mockInventoryItems
  const q = search.value.toLowerCase()
  return mockInventoryItems.filter((i) => i.name.toLowerCase().includes(q))
})
// ─── Stock level helpers ──────────────────────────────────
const maxQty = computed(() => Math.max(...mockInventoryItems.map((i) => i.quantity), 1))
function stockLevel(qty: number): 'high' | 'medium' | 'low' | 'out' {
  if (qty === 0) return 'out'
  if (qty <= 30) return 'low'
  if (qty <= 100) return 'medium'
  return 'high'
}
const stockColors: Record<string, string> = {
  high: 'bg-success-500',
  medium: 'bg-primary-500',
  low: 'bg-warning-500',
  out: 'bg-error-500'
}
const stockLabels: Record<string, string> = {
  high: 'Đủ',
  medium: 'Đủ',
  low: 'Thấp',
  out: 'Sắp hết'
}
// ─── Recent activity ──────────────────────────────────────
const recentMovements = computed(() =>
  [...mockInventoryMovements]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
)
function movementIcon(type: InventoryMovementType) {
  if (type === InventoryMovementType.IMPORT) return 'i-lucide-arrow-down-to-line'
  if (type === InventoryMovementType.EXPORT) return 'i-lucide-arrow-up-from-line'
  return 'i-lucide-alert-circle'
}
function movementColor(type: InventoryMovementType) {
  if (type === InventoryMovementType.IMPORT) return 'text-success-500'
  if (type === InventoryMovementType.EXPORT) return 'text-primary-500'
  return 'text-error-500'
}
function movementLabel(type: InventoryMovementType) {
  if (type === InventoryMovementType.IMPORT) return 'Nhập kho'
  if (type === InventoryMovementType.EXPORT) return 'Xuất kho'
  return 'Hao hụt'
}
// ─── Table columns ────────────────────────────────────────
const columns = [
  { accessorKey: 'name', header: 'Nguyên liệu' },
  { accessorKey: 'unit', header: 'Đơn vị' },
  { accessorKey: 'quantity', header: 'Số lượng' },
  { accessorKey: 'updated_at', header: 'Cập nhật' },
  { accessorKey: 'actions', header: 'Hành động' }
]
// ─── Handlers ─────────────────────────────────────────────
function handleAdd() {
  if (!newItemName.value.trim() || !newItemUnit.value.trim()) {
    toast.add({ title: 'Vui lòng điền đầy đủ', color: 'warning' })
    return
  }
  toast.add({ title: 'Thêm nguyên liệu thành công', color: 'success' })
  showAddModal.value = false
  newItemName.value = ''
  newItemUnit.value = ''
  newItemQty.value = 0
}
function handleEdit(item: (typeof mockInventoryItems)[0]) {
  editItem.value = { ...item }
}
function handleDelete(item: (typeof mockInventoryItems)[0]) {
  toast.add({ title: `Đã xóa ${item.name}`, color: 'success' })
}
// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>
<template>
  <div>
    <BasePageHeader
      title="Kho nguyên liệu"
      description="Quản lý nguyên liệu và theo dõi nhập xuất tồn"
      :breadcrumbs="[{ label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' }, { label: 'Kho' }]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/inventory/import">
          <UIcon name="i-lucide-arrow-down-to-line" class="mr-1 h-4 w-4" /> Nhập kho
        </UButton>
        <UButton to="/admin/inventory/export">
          <UIcon name="i-lucide-arrow-up-from-line" class="mr-1 h-4 w-4" /> Xuất kho
        </UButton>
      </template>
    </BasePageHeader>
    <template v-if="loading">
      <BasePageLoading />
    </template>
    <template v-else>
      <!-- KPI Stats -->
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" />
      </div>
      <!-- Main content: Table + Activity -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Left: Search + Table -->
        <div class="lg:col-span-2">
          <!-- Search + Add -->
          <div class="stagger-item mb-4 flex items-center gap-3" style="animation-delay: 200ms">
            <div class="flex-1">
              <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm nguyên liệu..." />
            </div>
            <UButton @click="showAddModal = true">
              <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm nguyên liệu
            </UButton>
          </div>
          <!-- Table -->
          <div
            class="animate-fade-in-up bg-surface ring-surface-border overflow-hidden rounded-xl ring-1"
            style="animation-delay: 280ms"
          >
            <UTable :columns="columns" :data="filteredItems">
              <template #name-cell="{ row }">
                <div class="flex items-center gap-3">
                  <div
                    class="bg-primary-50 dark:bg-primary-900/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  >
                    <UIcon name="i-lucide-package" class="text-primary-500 h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-surface-foreground text-sm font-medium">
                      {{ row.original.name }}
                    </p>
                    <div class="mt-0.5 flex items-center gap-1.5">
                      <div
                        class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                      >
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :class="stockColors[stockLevel(row.original.quantity)]"
                          :style="{
                            width: `${Math.min((row.original.quantity / maxQty) * 100, 100)}%`
                          }"
                        />
                      </div>
                      <span
                        class="text-[10px] font-medium"
                        :class="{
                          'text-success-500': stockLevel(row.original.quantity) === 'high',
                          'text-primary-500': stockLevel(row.original.quantity) === 'medium',
                          'text-warning-500': stockLevel(row.original.quantity) === 'low',
                          'text-error-500': stockLevel(row.original.quantity) === 'out'
                        }"
                      >
                        {{ stockLabels[stockLevel(row.original.quantity)] }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
              <template #unit-cell="{ row }">
                <span class="text-sm text-slate-600 dark:text-zinc-300">{{
                  row.original.unit
                }}</span>
              </template>
              <template #quantity-cell="{ row }">
                <span
                  class="text-sm font-semibold tabular-nums"
                  :class="
                    row.original.quantity <= 30
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-surface-foreground'
                  "
                >
                  {{ formatNumber(row.original.quantity) }}
                </span>
                <span class="ml-1 text-xs text-slate-400">{{ row.original.unit }}</span>
              </template>
              <template #updated_at-cell="{ row }">
                <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
                  formatDate(row.original.updated_at)
                }}</span>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex items-center gap-1">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="handleEdit(row.original)"
                  />
                  <UButton
                    variant="ghost"
                    color="error"
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="handleDelete(row.original)"
                  />
                </div>
              </template>
            </UTable>
          </div>
        </div>
        <!-- Right: Activity Timeline -->
        <div class="card stagger-item h-fit p-5" style="animation-delay: 360ms">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-surface-foreground flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-activity" class="text-primary-500 h-4 w-4" />
              Hoạt động gần đây
            </h3>
            <span
              class="text-primary-500 hover:text-primary-600 cursor-pointer text-xs transition-colors"
              >Tất cả →</span
            >
          </div>
          <div class="space-y-3">
            <div
              v-for="(mov, i) in recentMovements"
              :key="mov.id"
              class="animate-fade-in-up flex items-start gap-3"
              :style="{ animationDelay: `${i * 40 + 400}ms` }"
            >
              <div class="mt-0.5 flex-shrink-0">
                <UIcon
                  :name="movementIcon(mov.type)"
                  :class="['h-4 w-4', movementColor(mov.type)]"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-surface-foreground truncate text-sm font-medium">
                  {{ mov.inventory_item?.name || 'Nguyên liệu' }}
                </p>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <UBadge
                    :color="
                      mov.type === InventoryMovementType.IMPORT
                        ? 'success'
                        : mov.type === InventoryMovementType.EXPORT
                          ? 'info'
                          : 'error'
                    "
                    variant="subtle"
                    size="xs"
                  >
                    {{ movementLabel(mov.type) }}
                  </UBadge>
                  <span class="text-[10px] text-slate-400">{{ formatDate(mov.created_at) }}</span>
                </div>
                <p class="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">
                  {{ mov.note }}
                </p>
              </div>
              <span
                class="flex-shrink-0 text-sm font-semibold tabular-nums"
                :class="
                  mov.type === InventoryMovementType.IMPORT
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-error-600 dark:text-error-400'
                "
              >
                {{ mov.type === InventoryMovementType.IMPORT ? '+' : '-'
                }}{{ formatNumber(mov.quantity) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Modal -->
      <UModal v-model:open="showAddModal" title="Thêm nguyên liệu">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Tên nguyên liệu" required>
              <UInput v-model="newItemName" placeholder="VD: Gạo tẻ nguyên liệu..." />
            </UFormField>
            <UFormField label="Đơn vị" required>
              <UInput v-model="newItemUnit" placeholder="VD: kg, lít, cái..." />
            </UFormField>
            <UFormField label="Số lượng ban đầu">
              <UInput v-model="newItemQty" type="number" placeholder="0" />
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" color="neutral" @click="showAddModal = false">Hủy</UButton>
            <UButton @click="handleAdd">
              <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
