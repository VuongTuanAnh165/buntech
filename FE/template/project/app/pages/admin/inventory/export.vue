<script setup lang="ts">
import {
  ArrowLeft, Upload, TrendingDown, Package, AlertTriangle, Clock,
  CheckCircle2, MinusCircle, Activity, Wallet, Boxes, ArrowUpFromLine,
} from 'lucide-vue-next'
import { InventoryMovementType } from '../../../core/enums'
import type { InventoryItem, InventoryMovement } from '../../../core/types'
import { mockInventoryItems, mockInventoryMovements } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatNumber, formatDateTime, formatDate } = useFormat()

useHead({ title: `Xuất kho - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const quantityError = ref('')

const items = ref<InventoryItem[]>(mockInventoryItems.map(i => ({ ...i })))
const movements = ref<InventoryMovement[]>(mockInventoryMovements.map(m => ({ ...m })))

const selectedItemId = ref('')
const quantityInput = ref('')
const note = ref('')
const exportDate = ref(new Date().toISOString().slice(0, 10))

const quantity = computed<number>(() => {
  const n = Number(quantityInput.value)
  return Number.isNaN(n) ? 0 : n
})

const LOW_STOCK_THRESHOLD = 50

// Simulate loading
onMounted(() => {
  setTimeout(() => { loading.value = false }, 350)
})

// ─── Computed ───────────────────────────────────────────
const itemOptions = computed(() =>
  items.value
    .filter(i => !i.deleted_at)
    .map(i => ({
      value: i.id,
      label: `${i.name} — Tồn: ${formatNumber(i.quantity)} ${i.unit}`,
    })),
)

const selectedItem = computed(() => items.value.find(i => i.id === selectedItemId.value))
const maxStock = computed(() => Number(selectedItem.value?.quantity) || 0)

const stockAfterExport = computed(() => {
  if (!selectedItem.value) return null
  return Math.max(0, maxStock.value - (quantity.value || 0))
})

const isOverMax = computed(() => quantity.value > maxStock.value && selectedItem.value !== undefined)

// ─── KPIs ───────────────────────────────────────────────
const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const exportMovements = computed(() => movements.value.filter(m => m.type === InventoryMovementType.EXPORT))

const exportsThisMonth = computed(() =>
  exportMovements.value.filter(m => {
    const d = new Date(m.created_at)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }),
)

const totalExportsThisMonth = computed(() => exportsThisMonth.value.length)
const totalQuantityExported = computed(() =>
  exportsThisMonth.value.reduce((s, m) => s + m.quantity, 0),
)
const avgPerExport = computed(() =>
  totalExportsThisMonth.value > 0
    ? Math.round(totalQuantityExported.value / totalExportsThisMonth.value)
    : 0,
)

const kpiCards = computed(() => [
  {
    label: 'Xuất tháng này',
    value: formatNumber(totalExportsThisMonth.value),
    sub: 'phiếu xuất',
    icon: Upload,
    accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
  },
  {
    label: 'Tổng số lượng xuất',
    value: formatNumber(totalQuantityExported.value),
    sub: 'đơn vị',
    icon: ArrowUpFromLine,
    accent: 'bg-gradient-to-r from-info-500 to-info-400',
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-100 dark:ring-info-900/30',
  },
  {
    label: 'Trung bình mỗi phiếu',
    value: formatNumber(avgPerExport.value),
    sub: 'đơn vị / phiếu',
    icon: Activity,
    accent: 'bg-gradient-to-r from-success-500 to-success-400',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
  },
])

// ─── Recent export timeline (last 15) ────────────────────
const recentExports = computed(() =>
  [...exportMovements.value]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 15),
)

// ─── 7-day export trend chart ────────────────────────────
interface TrendDay { label: string; date: string; total: number; count: number }
const exportTrend = computed<TrendDay[]>(() => {
  const days: TrendDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const dayExports = exportMovements.value.filter(m => m.created_at.slice(0, 10) === dateStr)
    days.push({
      label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      date: dateStr,
      total: dayExports.reduce((s, m) => s + m.quantity, 0),
      count: dayExports.length,
    })
  }
  return days
})

const maxTrendValue = computed(() => Math.max(...exportTrend.value.map(d => d.total), 1))

// ─── Quantity validation ──────────────────────────────────
watch([quantityInput, selectedItemId], () => {
  if (quantity.value > 0 && selectedItem.value && quantity.value > maxStock.value) {
    quantityError.value = `Số lượng vượt quá tồn kho (${formatNumber(maxStock.value)} ${selectedItem.value.unit})`
  } else {
    quantityError.value = ''
  }
})

// ─── Submit ─────────────────────────────────────────────
function submit() {
  if (!selectedItemId.value) {
    toast.error('Vui lòng chọn nguyên liệu cần xuất')
    return
  }
  if (quantity.value <= 0) {
    toast.error('Số lượng xuất phải lớn hơn 0')
    return
  }
  if (quantity.value > maxStock.value) {
    toast.error('Số lượng xuất vượt quá tồn kho')
    return
  }
  saving.value = true
  setTimeout(() => {
    const item = items.value.find(i => i.id === selectedItemId.value)
    if (item) {
      item.quantity = maxStock.value - quantity.value
      item.updated_at = new Date().toISOString()
    }
    movements.value.unshift({
      id: `mov-${Date.now()}`,
      inventory_id: selectedItemId.value,
      inventory_item: item || null,
      type: InventoryMovementType.EXPORT,
      quantity: quantity.value,
      note: note.value || 'Xuất kho sản xuất',
      created_at: new Date().toISOString(),
    })
    toast.success(`Đã xuất ${formatNumber(quantity.value)} ${item?.unit || ''} ${item?.name || ''} khỏi kho`)
    quantityInput.value = ''
    note.value = ''
    selectedItemId.value = ''
    quantityError.value = ''
    saving.value = false
  }, 500)
}

function setMaxQuantity() {
  if (selectedItem.value) {
    quantityInput.value = String(maxStock.value)
  }
}
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Kho', to: '/admin/inventory' }, { label: 'Xuất kho' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
      <div class="min-w-0">
        <h1 class="page-title flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-900/30 flex items-center justify-center">
            <Upload class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </span>
          Xuất kho nguyên liệu
        </h1>
        <p class="page-subtitle">Ghi nhận nguyên liệu xuất khỏi kho để sản xuất hoặc bán hàng</p>
      </div>
      <div class="flex flex-wrap gap-2 flex-shrink-0">
        <NuxtLink to="/admin/inventory/import">
          <AppButton variant="outline" size="md"><Package class="w-4 h-4" aria-hidden="true" /> Nhập kho</AppButton>
        </NuxtLink>
        <AppButton variant="ghost" size="md" @click="router.push('/admin/inventory')">
          <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
        </AppButton>
      </div>
    </div>

    <!-- KPI Row -->
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
          <div :class="['kpi-accent', card.accent]" />
          <div class="flex items-start justify-between mb-2.5">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', card.bg, card.ring]">
              <component :is="card.icon" :class="['w-5 h-5', card.text]" aria-hidden="true" />
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
        <!-- New Export Card -->
        <div class="card p-5 stagger-item" style="animation-delay: 160ms">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Upload class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-surface-foreground">Phiếu xuất mới</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Chọn nguyên liệu và số lượng cần xuất</p>
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
              placeholder="Chọn nguyên liệu cần xuất..."
            />

            <!-- Stock preview card -->
            <Transition name="fade">
              <div v-if="selectedItemId && selectedItem" class="p-4 rounded-xl border transition-colors" :class="isOverMax ? 'border-danger-200 bg-danger-50/50 dark:bg-danger-900/10 dark:border-danger-800/40' : 'border-surface-border bg-surface-muted'">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="isOverMax ? 'bg-danger-100 dark:bg-danger-900/30' : 'bg-secondary-50 dark:bg-secondary-900/20'">
                      <Boxes :class="['w-5 h-5', isOverMax ? 'text-danger-600 dark:text-danger-400' : 'text-secondary-600 dark:text-secondary-400']" aria-hidden="true" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-surface-foreground">{{ selectedItem.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400">Tồn hiện tại</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold tabular-nums" :class="isOverMax ? 'text-danger-600 dark:text-danger-400' : 'text-surface-foreground'">{{ formatNumber(maxStock) }}</p>
                    <p class="text-xs text-slate-400 dark:text-zinc-500">{{ selectedItem.unit }}</p>
                  </div>
                </div>

                <!-- After export preview -->
                <div v-if="quantity > 0" class="mt-3 pt-3 border-t border-surface-border/60">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500 dark:text-zinc-400">Sau khi xuất:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-surface-foreground tabular-nums font-medium">{{ formatNumber(maxStock) }}</span>
                      <MinusCircle class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span class="text-primary-600 dark:text-primary-400 tabular-nums font-medium">{{ formatNumber(quantity) }}</span>
                      <span class="text-slate-400">=</span>
                      <span :class="['tabular-nums font-bold', stockAfterExport !== null && stockAfterExport <= 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">
                        {{ formatNumber(stockAfterExport ?? 0) }} {{ selectedItem.unit }}
                      </span>
                    </div>
                  </div>
                  <!-- Visual stock bar -->
                  <div class="mt-2.5 h-2 rounded-full bg-surface-border overflow-hidden flex">
                    <div
                      class="h-full bg-gradient-to-r from-secondary-400 to-secondary-300 transition-all duration-300"
                      :style="{ width: `${Math.min(100, (stockAfterExport ?? 0) / Math.max(1, maxStock) * 100)}%` }"
                    />
                  </div>
                </div>
              </div>
            </Transition>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <AppInput
                  v-model="quantityInput"
                  label="Số lượng"
                  type="number"
                  :min="1"
                  :max="maxStock"
                  :required="true"
                  :suffix="selectedItem?.unit || 'đơn vị'"
                  :error="quantityError"
                />
                <button
                  v-if="selectedItem"
                  type="button"
                  class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-1.5"
                  @click="setMaxQuantity"
                >
                  Xuất toàn bộ ({{ formatNumber(maxStock) }} {{ selectedItem.unit }})
                </button>
              </div>
              <AppInput
                v-model="exportDate"
                label="Ngày xuất"
                type="date"
                :required="true"
              />
            </div>

            <AppInput
              v-model="note"
              label="Ghi chú"
              placeholder="Thông tin thêm về lần xuất này..."
            />

            <div class="flex items-center gap-3 pt-1">
              <AppButton :loading="saving" variant="primary" size="lg" type="submit" :disabled="!selectedItemId || quantity <= 0 || !!quantityError">
                <Upload class="w-4 h-4" aria-hidden="true" /> Xuất khỏi kho
              </AppButton>
              <AppButton variant="ghost" size="lg" type="button" @click="selectedItemId = ''; quantityInput = ''; note = ''; quantityError = ''">
                Xoá form
              </AppButton>
            </div>
          </form>
        </div>

        <!-- 7-day Export Trend Chart -->
        <div class="card p-5 stagger-item" style="animation-delay: 220ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                <TrendingDown class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-surface-foreground">Xu hướng xuất kho</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">7 ngày gần nhất</p>
              </div>
            </div>
          </div>

          <template v-if="loading">
            <div class="flex items-end justify-between gap-2 h-[180px]">
              <div v-for="i in 7" :key="i" class="flex-1 flex flex-col items-center gap-2">
                <AppSkeleton height="h-24" class="w-full" />
                <AppSkeleton height="h-3" width="w-6" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-end justify-between gap-2 sm:gap-3 h-[180px] px-1">
              <div
                v-for="(day, i) in exportTrend"
                :key="i"
                class="flex-1 flex flex-col items-center gap-2 group relative"
              >
                <!-- Tooltip -->
                <div v-if="day.total > 0" class="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                  <div class="bg-slate-900 dark:bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                    <div class="font-medium">{{ day.label }}, {{ formatDate(day.date) }}</div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-info-300">Xuất:</span>
                      <span class="font-semibold tabular-nums">{{ formatNumber(day.total) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-400">Phiếu:</span>
                      <span class="font-semibold tabular-nums">{{ day.count }}</span>
                    </div>
                  </div>
                </div>

                <!-- Bar -->
                <div class="w-full flex items-end justify-center h-[140px]">
                  <div
                    class="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-info-500 to-info-400 transition-all duration-500 group-hover:from-info-600 group-hover:to-info-500"
                    :style="{ height: `${Math.max(4, (day.total / maxTrendValue) * 100)}%` }"
                    :aria-label="`${day.label}: ${formatNumber(day.total)}`"
                  />
                </div>
                <span class="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{{ day.label }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- RIGHT: 40% -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Recent Export Activity Timeline -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                <Clock class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Hoạt động xuất gần đây</h2>
            </div>
            <span class="text-xs text-slate-400 dark:text-zinc-500">{{ recentExports.length }} phiếu</span>
          </div>

          <template v-if="loading">
            <div class="space-y-3">
              <div v-for="i in 5" :key="i" class="flex gap-3">
                <AppSkeleton height="h-8" width="w-8" class="rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <AppSkeleton height="h-3.5" width="w-3/4" />
                  <AppSkeleton height="h-3" width="w-1/2" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="recentExports.length">
            <div class="relative max-h-[520px] overflow-y-auto pr-1">
              <div class="absolute left-4 top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
              <div
                v-for="(exp, i) in recentExports"
                :key="exp.id"
                class="relative flex gap-3 pb-4 last:pb-0 stagger-item"
                :style="{ animationDelay: `${260 + i * 30}ms` }"
              >
                <div class="relative z-10 w-8 h-8 rounded-lg bg-info-50 dark:bg-info-900/20 ring-1 ring-info-100 dark:ring-info-900/30 flex items-center justify-center flex-shrink-0">
                  <ArrowUpFromLine class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ exp.inventory_item?.name || 'Nguyên liệu' }}</p>
                    <span class="text-sm font-semibold text-info-600 dark:text-info-400 tabular-nums flex-shrink-0">−{{ formatNumber(exp.quantity) }}</span>
                  </div>
                  <p v-if="exp.note" class="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">{{ exp.note }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1 tabular-nums">
                    <Clock class="w-3 h-3" aria-hidden="true" /> {{ formatDateTime(exp.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <AppEmptyState v-else title="Chưa có hoạt động" description="Phiếu xuất sẽ hiển thị tại đây" />
        </div>
      </div>
    </div>
  </div>
</template>
