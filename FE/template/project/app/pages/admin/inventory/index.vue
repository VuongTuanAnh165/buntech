<script setup lang="ts">
import {
  Package, PackagePlus, AlertTriangle, Activity, Plus, Pencil, Trash2,
  ArrowDownToLine, ArrowUpFromLine, MinusCircle, ArrowUpRight, Boxes, Layers,
} from 'lucide-vue-next'
import { InventoryMovementType } from '../../../core/enums'
import type { InventoryItem, InventoryMovement } from '../../../core/types'
import { mockInventoryItems, mockInventoryMovements } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatDate, formatNumber } = useFormat()

useHead({ title: `Kho nguyên liệu - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── Reactive local copies for CRUD ───────────────────────────────
const items = ref<InventoryItem[]>(mockInventoryItems.map(i => ({ ...i })))
const movements = ref<InventoryMovement[]>(mockInventoryMovements.map(m => ({ ...m })))

const loading = ref(true)
const error = ref(false)

const search = ref('')
const sortBy = ref<'name' | 'quantity' | 'updated_at'>('updated_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', unit: 'kg', quantity: 0 })
const saving = ref(false)

const deleteTarget = ref<InventoryItem | null>(null)
const deleting = ref(false)

const LOW_STOCK_THRESHOLD = 50

// Simulate loading for skeleton state
onMounted(() => {
  setTimeout(() => { loading.value = false }, 350)
})

// ─── KPIs ──────────────────────────────────────────────────────────
const activeItems = computed(() => items.value.filter(i => !i.deleted_at))

const totalItems = computed(() => activeItems.value.length)
const totalQuantity = computed(() => activeItems.value.reduce((s, i) => s + i.quantity, 0))
const lowStockItems = computed(() => activeItems.value.filter(i => i.quantity < LOW_STOCK_THRESHOLD))

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()
const movementsThisMonth = computed(() =>
  movements.value.filter(m => {
    const d = new Date(m.created_at)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }),
)

const kpiCards = computed(() => [
  {
    label: 'Tổng nguyên liệu',
    value: formatNumber(totalItems.value),
    icon: Boxes,
    accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    trend: '+2',
    trendUp: true,
  },
  {
    label: 'Tổng số lượng',
    value: formatNumber(totalQuantity.value),
    icon: Package,
    accent: 'bg-gradient-to-r from-info-500 to-info-400',
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-100 dark:ring-info-900/30',
    trend: '+8.4%',
    trendUp: true,
  },
  {
    label: 'Sắp hết hàng',
    value: formatNumber(lowStockItems.value.length),
    icon: AlertTriangle,
    accent: 'bg-gradient-to-r from-warning-500 to-warning-400',
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-100 dark:ring-warning-900/30',
    trend: lowStockItems.value.length > 0 ? 'Cần nhập' : 'Ổn',
    trendUp: false,
  },
  {
    label: 'Giao dịch tháng này',
    value: formatNumber(movementsThisMonth.value.length),
    icon: Activity,
    accent: 'bg-gradient-to-r from-success-500 to-success-400',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
    trend: '+15%',
    trendUp: true,
  },
])

// ─── Filtered + sorted items ────────────────────────────────────────
const filteredItems = computed(() => {
  let result = activeItems.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(i => i.name.toLowerCase().includes(q) || i.unit.toLowerCase().includes(q))
  }
  const sorted = [...result]
  sorted.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortBy.value === 'quantity') cmp = a.quantity - b.quantity
    else cmp = a.updated_at.localeCompare(b.updated_at)
    return sortDirection.value === 'asc' ? cmp : -cmp
  })
  return sorted
})

function toggleSort(col: 'name' | 'quantity' | 'updated_at') {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}

// ─── Stock level helpers ────────────────────────────────────────────
function stockLevel(item: InventoryItem): { pct: number; color: string; label: string } {
  const pct = Math.min(100, Math.round((item.quantity / 500) * 100))
  if (item.quantity < LOW_STOCK_THRESHOLD) {
    return { pct, color: 'bg-danger-500', label: 'Sắp hết' }
  }
  if (item.quantity < 150) {
    return { pct, color: 'bg-warning-500', label: 'Thấp' }
  }
  return { pct, color: 'bg-success-500', label: 'Đủ' }
}

function quantityClass(item: InventoryItem): string {
  if (item.quantity < LOW_STOCK_THRESHOLD) return 'text-danger-600 dark:text-danger-400'
  if (item.quantity < 150) return 'text-warning-600 dark:text-warning-400'
  return 'text-success-600 dark:text-success-400'
}

// ─── Recent movements ───────────────────────────────────────────────
const recentMovements = computed(() =>
  [...movements.value]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10),
)

const movementMeta: Record<InventoryMovementType, { color: 'success' | 'info' | 'danger'; icon: typeof ArrowDownToLine; label: string; sign: string }> = {
  [InventoryMovementType.IMPORT]: { color: 'success', icon: ArrowDownToLine, label: 'Nhập kho', sign: '+' },
  [InventoryMovementType.EXPORT]: { color: 'info', icon: ArrowUpFromLine, label: 'Xuất kho', sign: '−' },
  [InventoryMovementType.LOSS]: { color: 'danger', icon: MinusCircle, label: 'Hao hụt', sign: '−' },
}

// ─── CRUD ───────────────────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { name: '', unit: 'kg', quantity: 0 }
  showModal.value = true
}

function openEdit(item: InventoryItem) {
  editingId.value = item.id
  form.value = { name: item.name, unit: item.unit, quantity: item.quantity }
  showModal.value = true
}

function save() {
  if (!form.value.name.trim()) {
    toast.error('Vui lòng nhập tên nguyên liệu')
    return
  }
  if (form.value.quantity < 0) {
    toast.error('Số lượng không được âm')
    return
  }
  saving.value = true
  setTimeout(() => {
    if (editingId.value) {
      const idx = items.value.findIndex(i => i.id === editingId.value)
      if (idx !== -1) {
        items.value[idx] = {
          ...items.value[idx],
          name: form.value.name.trim(),
          unit: form.value.unit.trim() || 'kg',
          quantity: form.value.quantity,
          updated_at: new Date().toISOString(),
        }
      }
      // Add a movement for the edit
      const oldQty = mockInventoryItems.find(i => i.id === editingId.value)?.quantity || 0
      const diff = form.value.quantity - oldQty
      if (diff !== 0) {
        movements.value.unshift({
          id: `mov-${Date.now()}`,
          inventory_id: editingId.value,
          inventory_item: items.value[idx] || null,
          type: diff > 0 ? InventoryMovementType.IMPORT : InventoryMovementType.EXPORT,
          quantity: Math.abs(diff),
          note: 'Điều chỉnh khi sửa',
          created_at: new Date().toISOString(),
        })
      }
      toast.success('Đã cập nhật nguyên liệu')
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        name: form.value.name.trim(),
        unit: form.value.unit.trim() || 'kg',
        quantity: form.value.quantity,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      items.value.unshift(newItem)
      if (form.value.quantity > 0) {
        movements.value.unshift({
          id: `mov-${Date.now() + 1}`,
          inventory_id: newItem.id,
          inventory_item: newItem,
          type: InventoryMovementType.IMPORT,
          quantity: form.value.quantity,
          note: 'Nhập kho ban đầu',
          created_at: new Date().toISOString(),
        })
      }
      toast.success('Đã thêm nguyên liệu mới')
    }
    showModal.value = false
    saving.value = false
  }, 400)
}

function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    const idx = items.value.findIndex(i => i.id === deleteTarget.value!.id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], deleted_at: new Date().toISOString() }
    }
    toast.success('Đã xóa nguyên liệu')
    deleteTarget.value = null
    deleting.value = false
  }, 400)
}

const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa nguyên liệu "${deleteTarget.value.name}"? Nguyên liệu sẽ bị ẩn và không thể sử dụng.`
    : '',
)

const columns = computed(() => [
  { key: 'name', label: 'Nguyên liệu', sortable: true },
  { key: 'unit', label: 'Đơn vị', hideOnMobile: true },
  { key: 'quantity', label: 'Số lượng', sortable: true, align: 'right' as const },
  { key: 'updated_at', label: 'Cập nhật', sortable: true, hideOnMobile: true },
  { key: 'actions', label: t('common.actions'), align: 'right' as const, hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Kho nguyên liệu" subtitle="Quản lý nguyên liệu và theo dõi nhập xuất tồn" breadcrumb-label="Kho">
      <template #actions>
        <NuxtLink to="/admin/inventory/import">
          <AppButton variant="outline">
            <ArrowDownToLine class="w-4 h-4" aria-hidden="true" /> Nhập kho
          </AppButton>
        </NuxtLink>
        <NuxtLink to="/admin/inventory/export">
          <AppButton>
            <ArrowUpFromLine class="w-4 h-4" aria-hidden="true" /> Xuất kho
          </AppButton>
        </NuxtLink>
      </template>
    </AppPageHeader>

    <AppErrorState v-if="error" message="Không thể tải dữ liệu kho. Vui lòng thử lại." @retry="loading = false" />

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
              <span
                :class="[
                  'text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-md',
                  card.trendUp
                    ? 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20'
                    : 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20',
                ]"
              >
                {{ card.trend }}
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left: Items table -->
        <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 100ms">
          <AppToolbar>
            <template #search>
              <AppSearchBar v-model="search" placeholder="Tìm nguyên liệu..." />
            </template>
            <template #filters>
              <AppButton size="sm" variant="primary" @click="openAdd">
                <Plus class="w-4 h-4" aria-hidden="true" /> Thêm nguyên liệu
              </AppButton>
            </template>
          </AppToolbar>

          <AppTable
            :columns="columns"
            :rows="filteredItems as unknown as Record<string, unknown>[]"
            :loading="loading"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            row-key="id"
            empty-title="Chưa có nguyên liệu nào"
            empty-description="Thêm nguyên liệu để bắt đầu quản lý kho."
            :empty-cta-text="'Thêm nguyên liệu'"
            @sort="toggleSort"
            @empty-action="openAdd"
          >
            <template #cell-name="{ row }">
              <div class="flex items-center gap-3 min-w-0">
                <div :class="[
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  stockLevel(row as InventoryItem).color === 'bg-danger-500' ? 'bg-danger-50 dark:bg-danger-900/20' :
                  stockLevel(row as InventoryItem).color === 'bg-warning-500' ? 'bg-warning-50 dark:bg-warning-900/20' :
                  'bg-success-50 dark:bg-success-900/20',
                ]">
                  <Package :class="[
                    'w-4 h-4',
                    stockLevel(row as InventoryItem).color === 'bg-danger-500' ? 'text-danger-600 dark:text-danger-400' :
                    stockLevel(row as InventoryItem).color === 'bg-warning-500' ? 'text-warning-600 dark:text-warning-400' :
                    'text-success-600 dark:text-success-400',
                  ]" aria-hidden="true" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-surface-foreground truncate">{{ (row as InventoryItem).name }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="h-1.5 w-24 rounded-full bg-surface-hover overflow-hidden">
                      <div
                        :class="['h-full rounded-full transition-all duration-500', stockLevel(row as InventoryItem).color]"
                        :style="{ width: `${stockLevel(row as InventoryItem).pct}%` }"
                      />
                    </div>
                    <span :class="['text-[11px] font-medium', quantityClass(row as InventoryItem)]">
                      {{ stockLevel(row as InventoryItem).label }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template #cell-unit="{ value }">
              <span class="text-sm text-slate-500 dark:text-zinc-400">{{ value }}</span>
            </template>

            <template #cell-quantity="{ row }">
              <span :class="['font-semibold tabular-nums', quantityClass(row as InventoryItem)]">
                {{ formatNumber((row as InventoryItem).quantity) }}
                <span class="text-xs font-normal text-slate-400 dark:text-zinc-500">{{ (row as InventoryItem).unit }}</span>
              </span>
            </template>

            <template #cell-updated_at="{ value }">
              <span class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate(value as string) }}</span>
            </template>

            <template #cell-actions="{ row }">
              <div class="flex items-center justify-end gap-1">
                <AppIconButton :icon="Pencil" label="Sửa" variant="edit" @click="openEdit(row as InventoryItem)" />
                <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click="deleteTarget = row as InventoryItem" />
              </div>
            </template>

            <!-- Mobile card -->
            <template #mobile-row="{ row }">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div :class="[
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      stockLevel(row as InventoryItem).color === 'bg-danger-500' ? 'bg-danger-50 dark:bg-danger-900/20' :
                      stockLevel(row as InventoryItem).color === 'bg-warning-500' ? 'bg-warning-50 dark:bg-warning-900/20' :
                      'bg-success-50 dark:bg-success-900/20',
                    ]">
                      <Package :class="[
                        'w-4 h-4',
                        stockLevel(row as InventoryItem).color === 'bg-danger-500' ? 'text-danger-600 dark:text-danger-400' :
                        stockLevel(row as InventoryItem).color === 'bg-warning-500' ? 'text-warning-600 dark:text-warning-400' :
                        'text-success-600 dark:text-success-400',
                      ]" aria-hidden="true" />
                    </div>
                    <p class="font-medium text-surface-foreground truncate">{{ (row as InventoryItem).name }}</p>
                  </div>
                  <span :class="['font-semibold text-sm tabular-nums', quantityClass(row as InventoryItem)]">
                    {{ formatNumber((row as InventoryItem).quantity) }} {{ (row as InventoryItem).unit }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <AppBadge :color="stockLevel(row as InventoryItem).color === 'bg-danger-500' ? 'danger' : stockLevel(row as InventoryItem).color === 'bg-warning-500' ? 'warning' : 'success'" variant="soft" :dot="true">
                    {{ stockLevel(row as InventoryItem).label }}
                  </AppBadge>
                  <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatDate((row as InventoryItem).updated_at) }}</span>
                </div>
              </div>
            </template>
          </AppTable>
        </div>

        <!-- Right: Recent movements -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <Activity class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Hoạt động gần đây</h2>
            </div>
            <NuxtLink to="/admin/inventory/export" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
              Tất cả <ArrowUpRight class="w-3 h-3" aria-hidden="true" />
            </NuxtLink>
          </div>

          <template v-if="loading">
            <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0">
              <AppSkeleton height="h-8" width="w-8" class="rounded-lg" />
              <div class="flex-1">
                <AppSkeleton height="h-3.5" class="mb-1" />
                <AppSkeleton height="h-3" width="w-1/2" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="relative">
              <!-- Timeline line -->
              <div class="absolute left-4 top-0 bottom-0 w-px bg-surface-border" aria-hidden="true" />
              <div
                v-for="(m, i) in recentMovements"
                :key="m.id"
                class="relative flex items-start gap-3 pb-4 last:pb-0 stagger-item"
                :style="{ animationDelay: `${i * 30}ms` }"
              >
                <div :class="[
                  'relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-4 ring-surface',
                  movementMeta[m.type].color === 'success' ? 'bg-success-50 dark:bg-success-900/20' :
                  movementMeta[m.type].color === 'info' ? 'bg-info-50 dark:bg-info-900/20' :
                  'bg-danger-50 dark:bg-danger-900/20',
                ]">
                  <component
                    :is="movementMeta[m.type].icon"
                    :class="[
                      'w-4 h-4',
                      movementMeta[m.type].color === 'success' ? 'text-success-600 dark:text-success-400' :
                      movementMeta[m.type].color === 'info' ? 'text-info-600 dark:text-info-400' :
                      'text-danger-600 dark:text-danger-400',
                    ]"
                    aria-hidden="true"
                  />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center justify-between gap-2 mb-0.5">
                    <p class="text-sm font-medium text-surface-foreground truncate">
                      {{ m.inventory_item?.name || 'Nguyên liệu' }}
                    </p>
                    <span :class="[
                      'text-sm font-semibold tabular-nums flex-shrink-0',
                      movementMeta[m.type].color === 'success' ? 'text-success-600 dark:text-success-400' :
                      movementMeta[m.type].color === 'info' ? 'text-info-600 dark:text-info-400' :
                      'text-danger-600 dark:text-danger-400',
                    ]">
                      {{ movementMeta[m.type].sign }}{{ formatNumber(m.quantity) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <AppBadge :color="movementMeta[m.type].color" variant="soft" size="sm">
                      {{ movementMeta[m.type].label }}
                    </AppBadge>
                    <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatDate(m.created_at) }}</span>
                  </div>
                  <p v-if="m.note" class="text-xs text-slate-500 dark:text-zinc-400 mt-1 italic truncate">{{ m.note }}</p>
                </div>
              </div>
            </div>
          </template>

          <AppEmptyState v-if="!loading && recentMovements.length === 0" description="Chưa có hoạt động nào." />
        </div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <AppModal v-model="showModal" :title="editingId ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'" size="sm">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.name" label="Tên nguyên liệu" placeholder="VD: Gạo tẻ nguyên liệu" :required="true" />
        <AppInput v-model="form.unit" label="Đơn vị" placeholder="VD: kg, lít, cái" />
        <div>
          <label class="form-label" for="qty-input">Số lượng</label>
          <input
            id="qty-input"
            v-model.number="form.quantity"
            type="number"
            min="0"
            placeholder="0"
            class="form-input"
          >
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showModal = false">Hủy</AppButton>
        <AppButton :loading="saving" @click="save">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</AppButton>
      </template>
    </AppModal>

    <!-- Delete Confirm -->
    <AppConfirmDialog
      :model-value="!!deleteTarget"
      title="Xóa nguyên liệu"
      :message="deleteConfirmMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
