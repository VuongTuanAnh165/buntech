<script setup lang="ts">
import {
  ArrowLeft, Download, Package, TrendingUp, Clock, AlertTriangle,
  Box, Plus, CheckCircle2, Truck, FlaskConical, BarChart3, Calendar,
} from 'lucide-vue-next'
import { InventoryMovementType } from '../../../core/enums'
import type { InventoryItem, InventoryMovement } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatNumber, formatDateTime, formatDate } = useFormat()

definePageMeta({ layout: 'admin' })

// ─── State ─────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)

const items = ref<InventoryItem[]>([])
const movements = ref<(InventoryMovement & { inventory_item?: InventoryItem | null })[]>([])

const selectedItemId = ref('')
const quantityInput = ref('')
const supplier = ref('')
const note = ref('')
const importDate = ref(new Date().toISOString().slice(0, 10))

const quantity = computed<number>(() => {
  const n = Number(quantityInput.value)
  return Number.isNaN(n) ? 0 : n
})

// ─── Threshold for low-stock alerts ─────────────────────
const LOW_STOCK_THRESHOLD = 60

interface InventoryItemWithMeta extends InventoryItem {
  minStock: number
  unitCost: number
}

const itemsWithMeta = computed<InventoryItemWithMeta[]>(() =>
  items.value.map(it => {
    const isSmall = it.unit === 'kg' || it.unit === 'lít'
    return {
      ...it,
      minStock: isSmall ? LOW_STOCK_THRESHOLD : Math.ceil(it.quantity * 0.25) || 50,
      unitCost: estimateUnitCost(it),
    }
  }),
)

function estimateUnitCost(it: InventoryItem): number {
  const map: Record<string, number> = {
    'Gạo tẻ nguyên liệu': 18000,
    'Gạo lứt nguyên liệu': 22000,
    'Tinh bột khoai lang': 35000,
    'Dầu thực vật': 28000,
    'Bao bì PE 500g': 800,
    'Bao bì PE 1kg': 1200,
    'Hộp nhựa 500g': 2500,
    'Muối': 8000,
    'Nước lọc': 5000,
    'Chất ổn định (tự nhiên)': 120000,
    'Tem nhãn': 300,
    'Dây thắt buộc': 150,
  }
  return map[it.name] ?? 10000
}

// ─── KPIs ───────────────────────────────────────────────
const currentMonth = new Date().toISOString().slice(0, 7)
const importsThisMonth = computed(() =>
  movements.value.filter(m => m.type === InventoryMovementType.IMPORT && m.created_at.slice(0, 7) === currentMonth)
)
const totalImportsThisMonth = computed(() => importsThisMonth.value.length)
const totalQuantityImported = computed(() =>
  importsThisMonth.value.reduce((sum, m) => sum + m.quantity, 0)
)
const avgPerImport = computed(() =>
  totalImportsThisMonth.value > 0 ? Math.round(totalQuantityImported.value / totalImportsThisMonth.value) : 0
)

// ─── 7-day chart data ───────────────────────────────────
const last7Days = computed(() => {
  const days: { label: string; date: string; count: number; qty: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayImports = movements.value.filter(m =>
      m.type === InventoryMovementType.IMPORT && m.created_at.slice(0, 10) === dateStr
    )
    days.push({
      label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      date: dateStr,
      count: dayImports.length,
      qty: dayImports.reduce((s, m) => s + m.quantity, 0),
    })
  }
  return days
})
const max7DayQty = computed(() => Math.max(...last7Days.value.map(d => d.qty), 1))

// ─── Low stock & quick import ───────────────────────────
const lowStockItems = computed(() =>
  itemsWithMeta.value
    .filter(it => it.quantity <= it.minStock)
    .sort((a, b) => a.quantity / a.minStock - b.quantity / b.minStock),
)
const quickImportItems = computed(() => lowStockItems.value.slice(0, 6))

function quickSelect(item: InventoryItem) {
  selectedItemId.value = item.id
  const suggested = Math.max(100, Math.ceil(item.quantity * 0.5))
  quantityInput.value = String(suggested)
  toast.info(`Đã chọn "${item.name}" — gợi ý nhập ${suggested} ${item.unit}`)
}

// ─── Recent activity (last 15 IMPORT movements) ────────
const recentImports = computed(() =>
  movements.value
    .filter(m => m.type === InventoryMovementType.IMPORT)
    .slice(0, 15)
    .map(m => ({
      ...m,
      item: items.value.find(i => i.id === m.inventory_id),
    })),
)

// ─── Item select options ────────────────────────────────
const itemOptions = computed(() =>
  items.value.map(i => ({
    value: i.id,
    label: `${i.name} — Tồn: ${formatNumber(i.quantity)} ${i.unit}`,
  })),
)

const selectedItem = computed(() => items.value.find(i => i.id === selectedItemId.value))

// Stock preview
const newStock = computed(() =>
  selectedItem.value ? selectedItem.value.quantity + quantity.value : 0
)
const previewPct = computed(() => {
  if (!selectedItem.value || quantity.value <= 0) return 0
  const max = Math.max(selectedItem.value.quantity, newStock.value, 200)
  return Math.min(100, Math.round((newStock.value / max) * 100))
})
const currentStockPct = computed(() => {
  if (!selectedItem.value) return 0
  const max = Math.max(selectedItem.value.quantity, newStock.value, 200)
  return Math.min(100, Math.round((selectedItem.value.quantity / max) * 100))
})

// ─── Data loading ──────────────────────────────────────
function loadData() {
  loading.value = true
  try {
    items.value = [...mockInventoryItems].sort((a, b) => a.name.localeCompare(b.name))
    movements.value = [...mockInventoryMovements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } finally {
    loading.value = false
  }
}

// ─── Submit ─────────────────────────────────────────────
function submit() {
  if (!selectedItemId.value) {
    toast.error('Vui lòng chọn nguyên liệu cần nhập')
    return
  }
  if (quantity.value <= 0) {
    toast.error('Số lượng nhập phải lớn hơn 0')
    return
  }
  saving.value = true
  setTimeout(() => {
    const item = items.value.find(i => i.id === selectedItemId.value)
    if (item) {
      // Update local quantity
      item.quantity = item.quantity + quantity.value
      item.updated_at = new Date().toISOString()
    }
    // Prepend to recent activity
    movements.value.unshift({
      id: `local-${Date.now()}`,
      inventory_id: selectedItemId.value,
      inventory_item: item ?? null,
      type: InventoryMovementType.IMPORT,
      quantity: quantity.value,
      note: note.value || `${supplier.value ? `NCC: ${supplier.value}` : 'Nhập kho'}`,
      created_at: new Date().toISOString(),
    })
    toast.success(`Đã nhập ${formatNumber(quantity.value)} ${item?.unit || ''} ${item?.name || ''} vào kho`)
    quantityInput.value = ''
    supplier.value = ''
    note.value = ''
    selectedItemId.value = ''
    saving.value = false
  }, 600)
}

onMounted(loadData)

// ─── KPI cards config ───────────────────────────────────
const kpiCards = computed(() => [
  {
    label: 'Nhập tháng này',
    value: String(totalImportsThisMonth.value),
    sub: 'phiếu nhập',
    icon: Download,
    color: 'primary' as const,
  },
  {
    label: 'Tổng lượng nhập',
    value: formatNumber(totalQuantityImported.value),
    sub: 'đơn vị',
    icon: Package,
    color: 'success' as const,
  },
  {
    label: 'TB mỗi phiếu',
    value: formatNumber(avgPerImport.value),
    sub: 'đơn vị/phiếu',
    icon: TrendingUp,
    color: 'secondary' as const,
  },
])

const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', bar: 'bg-gradient-to-r from-primary-500 to-primary-400' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30', bar: 'bg-gradient-to-r from-secondary-500 to-secondary-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', bar: 'bg-gradient-to-r from-success-500 to-success-400' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', bar: 'bg-gradient-to-r from-warning-500 to-warning-400' },
}
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.inventory'), to: '/admin/inventory' }, { label: 'Nhập kho' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
      <div class="min-w-0">
        <h1 class="page-title flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-900/30 flex items-center justify-center">
            <Download class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </span>
          Nhập kho nguyên liệu
        </h1>
        <p class="page-subtitle">Ghi nhận nguyên liệu nhập vào xưởng sản xuất bún</p>
      </div>
      <div class="flex flex-wrap gap-2 flex-shrink-0">
        <NuxtLink to="/admin/inventory/export">
          <AppButton variant="outline" size="md"><TrendingUp class="w-4 h-4" aria-hidden="true" /> Xuất kho</AppButton>
        </NuxtLink>
        <AppButton variant="ghost" size="md" @click="router.push('/admin/inventory')">
          <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
        </AppButton>
      </div>
    </div>

    <!-- KPI Row (3 cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="card p-5">
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
          <div :class="['kpi-accent', colorMap[card.color].bar]" />
          <div class="flex items-start justify-between mb-2.5">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', colorMap[card.color].bg, colorMap[card.color].ring]">
              <component :is="card.icon" :class="['w-5 h-5', colorMap[card.color].text]" aria-hidden="true" />
            </div>
          </div>
          <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
          <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 tabular-nums">{{ card.sub }}</p>
        </div>
      </template>
    </div>

    <!-- Main 2-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <!-- LEFT: 60% -->
      <div class="lg:col-span-3 space-y-4">
        <!-- New Import Card -->
        <div class="card p-5 stagger-item" style="animation-delay: 160ms">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Plus class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-surface-foreground">Phiếu nhập mới</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Điền thông tin nguyên liệu nhập vào kho</p>
            </div>
          </div>

          <template v-if="loading">
            <div class="space-y-4">
              <div v-for="i in 4" :key="i" class="space-y-2">
                <AppSkeleton height="h-4" width="w-24" />
                <AppSkeleton height="h-11" />
              </div>
              <AppSkeleton height="h-11" class="mt-2" />
            </div>
          </template>

          <form v-else class="space-y-4" @submit.prevent="submit">
            <AppSelect
              v-model="selectedItemId"
              label="Nguyên liệu"
              :required="true"
              :searchable="true"
              :options="itemOptions"
              placeholder="Chọn nguyên liệu cần nhập..."
            />

            <!-- Selected item info -->
            <Transition name="fade">
              <div v-if="selectedItemId && selectedItem" class="p-3 bg-surface-muted rounded-lg border border-surface-border">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                      <Box class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-surface-foreground">{{ selectedItem.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400">Tồn hiện tại: <span class="font-medium tabular-nums text-surface-foreground">{{ formatNumber(selectedItem.quantity) }} {{ selectedItem.unit }}</span></p>
                    </div>
                  </div>
                  <AppBadge :color="selectedItem.quantity <= LOW_STOCK_THRESHOLD ? 'danger' : 'success'" dot>
                    {{ selectedItem.quantity <= LOW_STOCK_THRESHOLD ? 'Sắp hết' : 'Đủ hàng' }}
                  </AppBadge>
                </div>
              </div>
            </Transition>

            <div class="grid grid-cols-2 gap-4">
              <AppInput
                v-model="quantityInput"
                label="Số lượng"
                type="number"
                :min="1"
                :required="true"
                :suffix="selectedItem?.unit || 'đơn vị'"
              />
              <AppInput
                v-model="importDate"
                label="Ngày nhập"
                type="date"
                :required="true"
              />
            </div>

            <AppInput
              v-model="supplier"
              label="Nhà cung cấp"
              placeholder="VD: Công ty Gạo Vàng, NCC Miền Tây..."
              :hint="supplier ? `Nhập từ: ${supplier}` : 'Tên nhà cung cấp (tuỳ chọn)'"
            />

            <AppInput
              v-model="note"
              label="Ghi chú"
              placeholder="Số lô, chất lượng, ghi nhận thêm..."
            />

            <!-- Stock preview bar -->
            <Transition name="fade">
              <div v-if="selectedItemId && selectedItem && quantity > 0" class="p-4 rounded-lg bg-surface-hover border border-surface-border">
                <div class="flex items-center gap-2 mb-3">
                  <BarChart3 class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  <p class="text-sm font-medium text-surface-foreground">Xem trước tồn kho sau nhập</p>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-xs text-slate-500 dark:text-zinc-400">Hiện tại:</span>
                  <span class="text-sm font-semibold text-surface-foreground tabular-nums">{{ formatNumber(selectedItem.quantity) }} {{ selectedItem.unit }}</span>
                  <span class="text-slate-400 dark:text-zinc-500">+</span>
                  <span class="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatNumber(quantity) }} {{ selectedItem.unit }}</span>
                  <span class="text-slate-400 dark:text-zinc-500">=</span>
                  <span class="text-base font-bold text-success-600 dark:text-success-400 tabular-nums">{{ formatNumber(newStock) }} {{ selectedItem.unit }}</span>
                </div>
                <div class="relative h-3 rounded-full bg-surface-border overflow-hidden">
                  <div
                    class="absolute left-0 top-0 h-full bg-slate-300 dark:bg-zinc-600 transition-all duration-500"
                    :style="{ width: `${currentStockPct}%` }"
                    aria-hidden="true"
                  />
                  <div
                    class="absolute left-0 top-0 h-full bg-gradient-to-r from-success-500 to-success-400 transition-all duration-500"
                    :style="{ width: `${previewPct}%` }"
                    aria-hidden="true"
                  />
                </div>
                <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">
                  Tăng {{ formatNumber(quantity) }} {{ selectedItem.unit }} ({{ Math.round((quantity / Math.max(selectedItem.quantity, 1)) * 100) }}% tồn hiện tại)
                </p>
              </div>
            </Transition>

            <div class="flex items-center gap-3 pt-1">
              <AppButton :loading="saving" variant="primary" size="lg" type="submit" :disabled="!selectedItemId || quantity <= 0">
                <Download class="w-4 h-4" aria-hidden="true" /> Nhập vào kho
              </AppButton>
              <AppButton variant="ghost" size="lg" type="button" @click="selectedItemId = ''; quantityInput = ''; supplier = ''; note = ''">
                Xoá form
              </AppButton>
            </div>
          </form>
        </div>

        <!-- 7-day chart -->
        <div class="card p-5 stagger-item" style="animation-delay: 220ms">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                <BarChart3 class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-surface-foreground">Xu hướng nhập (7 ngày)</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Số lượng nguyên liệu nhập theo ngày</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 px-2.5 py-1 rounded-md bg-surface-hover">
              <Calendar class="w-3.5 h-3.5" aria-hidden="true" /> 7 ngày gần nhất
            </div>
          </div>

          <template v-if="loading">
            <div class="flex items-end justify-between gap-2 h-40">
              <div v-for="i in 7" :key="i" class="flex-1"><AppSkeleton height="h-full" /></div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-end justify-between gap-2 h-40 pt-4">
              <div v-for="(day, i) in last7Days" :key="day.date" class="flex-1 flex flex-col items-center gap-2 group">
                <div class="w-full flex flex-col justify-end h-full relative">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-surface-foreground bg-surface-hover px-1.5 py-0.5 rounded whitespace-nowrap tabular-nums">
                    {{ formatNumber(day.qty) }}
                  </div>
                  <div
                    class="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-700 group-hover:from-primary-600 group-hover:to-primary-500"
                    :style="{
                      height: `${Math.max(4, (day.qty / max7DayQty) * 100)}%`,
                      animationDelay: `${i * 60}ms`,
                    }"
                  />
                </div>
                <span class="text-xs text-slate-500 dark:text-zinc-400 font-medium">{{ day.label }}</span>
                <span class="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">{{ day.count }} phiếu</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Quick Import Section -->
        <div v-if="!loading && quickImportItems.length" class="card p-5 stagger-item" style="animation-delay: 280ms">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
              <AlertTriangle class="w-4 h-4 text-warning-600 dark:text-warning-400" aria-hidden="true" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-surface-foreground">Nhập nhanh — sắp hết hàng</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Bấm để chọn tự động, gợi ý số lượng nhập</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in quickImportItems"
              :key="item.id"
              type="button"
              class="group flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-border bg-surface hover:border-warning-300 dark:hover:border-warning-700 hover:bg-warning-50 dark:hover:bg-warning-900/10 transition-all text-left"
              @click="quickSelect(item)"
            >
              <div class="w-7 h-7 rounded-md bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FlaskConical class="w-3.5 h-3.5 text-warning-600 dark:text-warning-400" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate max-w-[180px]">{{ item.name }}</p>
                <p class="text-xs text-danger-600 dark:text-danger-400 tabular-nums">Tồn: {{ formatNumber(item.quantity) }} {{ item.unit }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: 40% -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Recent Import Activity Timeline (last 15) -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                <Clock class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Hoạt động nhập gần đây</h2>
            </div>
            <span class="text-xs text-slate-400 dark:text-zinc-500">{{ recentImports.length }} phiếu</span>
          </div>

          <template v-if="loading">
            <div class="space-y-3">
              <div v-for="i in 6" :key="i" class="flex gap-3">
                <AppSkeleton height="h-8" width="w-8" class="rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <AppSkeleton height="h-3.5" width="w-3/4" />
                  <AppSkeleton height="h-3" width="w-1/2" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="recentImports.length">
            <div class="relative max-h-[600px] overflow-y-auto pr-1">
              <!-- Timeline line -->
              <div class="absolute left-4 top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
              <div
                v-for="(imp, i) in recentImports"
                :key="imp.id"
                class="relative flex gap-3 pb-4 last:pb-0 stagger-item"
                :style="{ animationDelay: `${260 + i * 30}ms` }"
              >
                <div class="relative z-10 w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 ring-1 ring-success-100 dark:ring-success-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ imp.inventory_item?.name || imp.note }}</p>
                    <span class="text-xs font-semibold text-success-600 dark:text-success-400 tabular-nums flex-shrink-0">+{{ formatNumber(imp.quantity) }}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{{ imp.note }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1 tabular-nums">
                    <Clock class="w-3 h-3" aria-hidden="true" /> {{ formatDateTime(imp.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <AppEmptyState v-else title="Chưa có hoạt động" description="Phiếu nhập sẽ hiển thị tại đây" />
        </div>

        <!-- Low Stock Alerts -->
        <div class="card p-5 stagger-item" style="animation-delay: 280ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                <AlertTriangle class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Cảnh báo tồn thấp</h2>
            </div>
            <AppBadge color="danger" variant="soft" :dot="true">{{ lowStockItems.length }}</AppBadge>
          </div>

          <template v-if="loading">
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-2">
                <AppSkeleton height="h-8" width="w-8" class="rounded-lg" />
                <div class="flex-1">
                  <AppSkeleton height="h-3.5" class="mb-1" />
                  <AppSkeleton height="h-3" width="w-1/2" />
                </div>
                <AppSkeleton height="h-6" width="w-12" />
              </div>
            </div>
          </template>

          <template v-else-if="lowStockItems.length">
            <div class="space-y-2">
              <div
                v-for="item in lowStockItems"
                :key="item.id"
                class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer group"
                @click="quickSelect(item)"
              >
                <div class="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
                  <Truck class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-surface-foreground truncate">{{ item.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-danger-600 dark:text-danger-400 tabular-nums">Tồn: {{ formatNumber(item.quantity) }} {{ item.unit }}</span>
                    <span class="text-slate-300 dark:text-zinc-600">·</span>
                    <span class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">Ngưỡng: {{ formatNumber(item.minStock) }}</span>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-xs font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatNumber(Math.max(100, item.minStock * 2)) }}</p>
                  <p class="text-[10px] text-slate-400 dark:text-zinc-500">đề xuất nhập</p>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <div class="w-12 h-12 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center mb-2">
              <CheckCircle2 class="w-6 h-6 text-success-600 dark:text-success-400" aria-hidden="true" />
            </div>
            <p class="text-sm font-medium text-surface-foreground">Tất cả nguyên liệu đủ hàng</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Không có cảnh báo tồn thấp</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
