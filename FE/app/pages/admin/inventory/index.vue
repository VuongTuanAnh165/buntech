<script setup lang="ts">
import { z } from 'zod'
import { rawMaterialService } from '~/services/rawMaterialService'
import { inventoryService } from '~/services/inventoryService'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Kho nguyên liệu - BunTech Admin' })
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const search = ref('')
const page = ref(1)
const perPage = ref(20)

// ─── Data Fetching ────────────────────────────────────────
const {
  data: summaryData,
  status: summaryStatus,
  refresh: refreshSummary
} = useAsyncData('inventory-summary', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await rawMaterialService.getSummary()
  return res.data
})

const {
  data: txData,
  status: txStatus,
  refresh: refreshMaterials
} = useAsyncData(
  'raw-materials',
  async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await rawMaterialService.getRawMaterials(
      page.value,
      perPage.value,
      search.value
    )
    return res.data
  },
  { watch: [page, search, perPage] }
)

const {
  data: historyData,
  status: historyStatus,
  refresh: refreshHistory
} = useAsyncData('inventory-history', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await inventoryService.getHistory(10)
  return res.data
})

watch(search, () => {
  page.value = 1
})

const loading = computed(() => summaryStatus.value === 'pending')

// ─── Computed KPIs ────────────────────────────────────────
const kpiStats = computed(() => {
  const summary = summaryData.value || { totalItems: 0, totalQuantity: 0, lowStockItems: 0 }
  return [
    {
      title: 'Tổng nguyên liệu',
      value: formatNumber(summary.totalItems),
      icon: 'i-lucide-package',
      color: 'primary' as const,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Tổng số lượng',
      value: formatNumber(summary.totalQuantity),
      icon: 'i-lucide-layers',
      color: 'success' as const,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Sắp hết hàng',
      value: String(summary.lowStockItems),
      icon: 'i-lucide-alert-triangle',
      color: 'warning' as const
    },
    {
      title: 'Giao dịch (10 gần nhất)',
      value: String(historyData.value?.length || 0),
      icon: 'i-lucide-repeat',
      color: 'info' as const,
      trend: { value: 0, isPositive: true }
    }
  ]
})

// ─── Filtered items ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawMaterials = computed(() => (txData.value?.data || []) as any[])
const totalItems = computed(() => txData.value?.meta?.total || 0)

// ─── Stock level helpers ──────────────────────────────────
const maxQty = computed(() => {
  if (!rawMaterials.value.length) return 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Math.max(...rawMaterials.value.map((i: any) => Number(i.currentStock || 0)), 1)
})
function stockLevel(qtyStr: string | number): 'high' | 'medium' | 'low' | 'out' {
  const qty = Number(qtyStr || 0)
  if (qty === 0) return 'out'
  if (qty <= 50) return 'low'
  if (qty <= 200) return 'medium'
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recentMovements = computed(() => (historyData.value || []) as any[])

function movementIcon(type: string) {
  if (type === 'in') return 'i-lucide-arrow-down-to-line'
  if (type === 'out') return 'i-lucide-arrow-up-from-line'
  return 'i-lucide-alert-circle'
}
function movementColor(type: string) {
  if (type === 'in') return 'text-success-500'
  if (type === 'out') return 'text-primary-500'
  return 'text-error-500'
}
function movementLabel(type: string) {
  if (type === 'in') return 'Nhập kho'
  if (type === 'out') return 'Xuất kho'
  return 'Hao hụt'
}

// ─── Table columns ────────────────────────────────────────
const columns = [
  { accessorKey: 'name', header: 'Nguyên liệu' },
  { accessorKey: 'unit', header: 'Đơn vị' },
  { accessorKey: 'quantity', header: 'Số lượng' },
  { accessorKey: 'createdAt', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Hành động' }
]

// ─── Form Logic (Native + Zod) ────────────────────────────
const showFormModal = ref(false)
const isEditing = ref(false)
const editId = ref<number | null>(null)

const formSchema = z.object({
  name: z.string().min(1, 'Tên nguyên liệu không được để trống').max(191),
  unit: z.string().min(1, 'Đơn vị không được để trống').max(50)
})

const state = reactive({
  name: '',
  unit: ''
})

const { formErrors, formRef, validate: validateForm } = useZodForm(formSchema)

const { handleSubmit, isSubmitting: formLoading } = useFormSubmit()

const submitData = handleSubmit(
  async (data: { name: string; unit: string }) => {
    if (isEditing.value && editId.value) {
      await rawMaterialService.updateRawMaterial(editId.value, data)
      toast.add({ title: 'Cập nhật thành công', color: 'success' })
    } else {
      await rawMaterialService.createRawMaterial(data)
      toast.add({ title: 'Thêm nguyên liệu thành công', color: 'success' })
    }
  },
  {
    formRef,
    onSuccess: () => {
      showFormModal.value = false
      refreshMaterials()
      refreshSummary()
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm(state)) {
    submitData(state)
  }
}

function handleAdd() {
  isEditing.value = false
  editId.value = null
  state.name = ''
  state.unit = ''
  formRef.value.clearErrors()
  showFormModal.value = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleEdit(item: any) {
  isEditing.value = true
  editId.value = item.id
  state.name = item.name
  state.unit = item.unit
  formRef.value.clearErrors()
  showFormModal.value = true
}

// ─── Import/Export Logic ──────────────────────────────────────────
const showImportModal = ref(false)
const showExportModal = ref(false)
const movementItemId = ref<number | ''>('')
const movementQuantity = ref<number | undefined>()
const movementNote = ref('')
const movementSubmitting = ref(false)

const movementOptions = computed(() =>
  rawMaterials.value.map((item) => ({
    label: `${item.name} (${formatNumber(item.currentStock || 0)} ${item.unit})`,
    value: item.id
  }))
)

const movementSelectedItem = computed(() =>
  rawMaterials.value.find((i) => i.id === movementItemId.value)
)
const movementExceedsStock = computed(() =>
  movementSelectedItem.value && movementQuantity.value
    ? movementQuantity.value > Number(movementSelectedItem.value.currentStock || 0)
    : false
)

function openImportModal() {
  movementItemId.value = ''
  movementQuantity.value = undefined
  movementNote.value = ''
  showImportModal.value = true
}

function openExportModal() {
  movementItemId.value = ''
  movementQuantity.value = undefined
  movementNote.value = ''
  showExportModal.value = true
}

async function handleImportSubmit() {
  if (!movementItemId.value || !movementQuantity.value) {
    toast.add({ title: 'Vui lòng điền đầy đủ thông tin', color: 'warning' })
    return
  }
  movementSubmitting.value = true
  try {
    await inventoryService.importMaterial({
      materialId: Number(movementItemId.value),
      quantity: Number(movementQuantity.value),
      note: movementNote.value
    })
    showImportModal.value = false
    refreshMaterials()
    refreshSummary()
    refreshHistory()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.add({ title: 'Có lỗi xảy ra', description: error.message, color: 'error' })
  } finally {
    movementSubmitting.value = false
  }
}

async function handleExportSubmit() {
  if (!movementItemId.value || !movementQuantity.value) {
    toast.add({ title: 'Vui lòng điền đầy đủ thông tin', color: 'warning' })
    return
  }
  if (movementExceedsStock.value) {
    toast.add({ title: 'Số lượng xuất vượt tồn kho', color: 'error' })
    return
  }
  movementSubmitting.value = true
  try {
    await inventoryService.exportMaterial({
      materialId: Number(movementItemId.value),
      quantity: Number(movementQuantity.value),
      note: movementNote.value
    })
    showExportModal.value = false
    refreshMaterials()
    refreshSummary()
    refreshHistory()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.add({ title: 'Có lỗi xảy ra', description: error.message, color: 'error' })
  } finally {
    movementSubmitting.value = false
  }
}

// ─── Delete Dialog ────────────────────────────────────────
const { confirm } = useConfirmDialog()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDelete(item: any) {
  const confirmed = await confirm({
    title: 'Xóa nguyên liệu',
    description: `Bạn có chắc chắn muốn xóa nguyên liệu "${item.name}"? Hành động này có thể ẩn dữ liệu tồn kho.`,
    confirmLabel: 'Xóa',
    cancelLabel: 'Hủy',
    color: 'error'
  })

  if (confirmed) {
    try {
      await rawMaterialService.deleteRawMaterial(item.id)
      toast.add({ title: `Đã xóa ${item.name}`, color: 'success' })
      refreshMaterials()
      refreshSummary()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.add({ title: 'Có lỗi xảy ra', description: err.message, color: 'error' })
    }
  }
}
</script>
<template>
  <div>
    <BasePageHeader
      title="Kho nguyên liệu"
      description="Quản lý nguyên liệu và theo dõi nhập xuất tồn"
      :breadcrumbs="[{ label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' }, { label: 'Kho' }]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" @click="openImportModal">
          <UIcon name="i-lucide-arrow-down-to-line" class="mr-1 h-4 w-4" /> Nhập kho
        </UButton>
        <UButton color="primary" @click="openExportModal">
          <UIcon name="i-lucide-arrow-up-from-line" class="mr-1 h-4 w-4" /> Xuất kho
        </UButton>
      </template>
    </BasePageHeader>
    <template v-if="loading">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" />
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="flex h-full flex-col lg:col-span-2">
          <div class="stagger-item mb-4 flex items-center gap-3" style="animation-delay: 200ms">
            <div class="flex-1">
              <BaseSearchInput v-model="search" placeholder="Tìm nguyên liệu..." />
            </div>
            <UButton @click="handleAdd">
              <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm nguyên liệu
            </UButton>
          </div>
          <div
            class="animate-fade-in-up bg-surface ring-surface-border overflow-hidden rounded-xl ring-1"
            style="animation-delay: 280ms"
          >
            <BaseDataTable
              :columns="columns"
              :rows="rawMaterials"
              :loading="txStatus === 'pending'"
            >
              <template #name-cell="{ row }">
                <div class="flex items-center gap-3">
                  <div
                    class="bg-primary-50 dark:bg-primary-900/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  >
                    <UIcon name="i-lucide-package" class="text-primary-500 h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-surface-foreground text-sm font-medium">
                      {{ row.name }}
                    </p>
                    <div class="mt-0.5 flex items-center gap-1.5">
                      <div
                        class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                      >
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :class="stockColors[stockLevel(row.currentStock)]"
                          :style="{
                            width: `${Math.min((Number(row.currentStock || 0) / maxQty) * 100, 100)}%`
                          }"
                        />
                      </div>
                      <span
                        class="text-[10px] font-medium"
                        :class="{
                          'text-success-500': stockLevel(row.currentStock) === 'high',
                          'text-primary-500': stockLevel(row.currentStock) === 'medium',
                          'text-warning-500': stockLevel(row.currentStock) === 'low',
                          'text-error-500': stockLevel(row.currentStock) === 'out'
                        }"
                      >
                        {{ stockLabels[stockLevel(row.currentStock)] }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
              <template #unit-cell="{ row }">
                <span class="text-sm text-slate-600 dark:text-zinc-300">{{ row.unit }}</span>
              </template>
              <template #quantity-cell="{ row }">
                <span
                  class="text-sm font-semibold tabular-nums"
                  :class="
                    Number(row.currentStock || 0) <= 50
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-surface-foreground'
                  "
                >
                  {{ formatNumber(Number(row.currentStock || 0)) }}
                </span>
                <span class="ml-1 text-xs text-slate-400">{{ row.unit }}</span>
              </template>
              <template #createdAt-cell="{ row }">
                <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
                  formatDate(row.createdAt)
                }}</span>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex items-center gap-1">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="handleEdit(row)"
                  />
                  <UButton
                    variant="ghost"
                    color="error"
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="handleDelete(row)"
                  />
                </div>
              </template>
              <template #pagination>
                <div
                  class="border-surface-border mt-4 flex items-center justify-between border-t px-4 py-2"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">
                      {{ totalItems === 0 ? 0 : (page - 1) * perPage + 1 }}-{{
                        Math.min(page * perPage, Number(totalItems))
                      }}
                      /
                      {{ totalItems }}
                    </span>
                    <USelectMenu v-model="perPage" :items="[10, 20, 50]" class="w-32">
                      <template #default>{{ perPage }} / trang</template>
                    </USelectMenu>
                  </div>
                  <UPagination v-model="page" :total="totalItems" :page-count="perPage" :max="5" />
                </div>
              </template>
            </BaseDataTable>
          </div>
        </div>
        <div class="card stagger-item flex h-full flex-col p-5" style="animation-delay: 360ms">
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
          <div v-if="historyStatus === 'pending'" class="flex justify-center py-4">
            <UIcon name="i-lucide-loader-2" class="text-primary-500 h-5 w-5 animate-spin" />
          </div>
          <div
            v-else-if="recentMovements.length === 0"
            class="py-4 text-center text-sm text-slate-500"
          >
            Chưa có giao dịch nào
          </div>
          <div v-else class="space-y-3">
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
                  {{ mov.rawMaterial?.name || 'Nguyên liệu' }}
                </p>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <UBadge
                    :color="mov.type === 'in' ? 'success' : mov.type === 'out' ? 'info' : 'error'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ movementLabel(mov.type) }}
                  </UBadge>
                  <span class="text-[10px] text-slate-400">{{
                    formatDate(String(mov.createdAt || mov.created_at))
                  }}</span>
                </div>
                <p
                  v-if="mov.note"
                  class="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400"
                >
                  {{ mov.note }}
                </p>
              </div>
              <span
                class="flex-shrink-0 text-sm font-semibold tabular-nums"
                :class="
                  mov.type === 'in'
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-error-600 dark:text-error-400'
                "
              >
                {{ mov.type === 'in' ? '+' : '-' }}{{ formatNumber(Number(mov.quantity || 0)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Add/Edit Modal -->
      <UModal
        v-model:open="showFormModal"
        :title="isEditing ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu'"
      >
        <template #body>
          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <UFormField label="Tên nguyên liệu" name="name" :error="formErrors.name" required>
              <UInput v-model="state.name" placeholder="VD: Gạo tẻ nguyên liệu..." />
            </UFormField>
            <UFormField label="Đơn vị" name="unit" :error="formErrors.unit" required>
              <UInput v-model="state.unit" placeholder="VD: kg, lít, cái..." />
            </UFormField>

            <div class="mt-6 flex justify-end gap-3">
              <UButton
                variant="outline"
                color="neutral"
                @click="
                  () => {
                    showFormModal = false
                  }
                "
                >Hủy</UButton
              >
              <UButton type="submit" :loading="formLoading">
                <UIcon name="i-lucide-save" class="mr-1 h-4 w-4" />
                {{ isEditing ? 'Cập nhật' : 'Thêm' }}
              </UButton>
            </div>
          </form>
        </template>
      </UModal>
      <!-- Import Modal -->
      <UModal v-model:open="showImportModal" title="Nhập kho">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Nguyên liệu" required>
              <USelectMenu
                v-model="movementItemId"
                :items="movementOptions"
                value-key="value"
                placeholder="Chọn nguyên liệu..."
                searchable
                class="w-full"
              />
            </UFormField>
            <Transition name="fade">
              <div
                v-if="movementSelectedItem"
                class="bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800/30 rounded-xl border p-3"
              >
                <div class="flex items-center justify-between">
                  <p class="text-surface-foreground text-xs font-medium">Tồn kho hiện tại</p>
                  <p class="text-success-600 dark:text-success-400 text-sm font-bold tabular-nums">
                    {{ formatNumber(movementSelectedItem.currentStock || 0) }}
                    {{ movementSelectedItem.unit }}
                  </p>
                </div>
              </div>
            </Transition>
            <UFormField label="Số lượng nhập" required>
              <UInput v-model="movementQuantity" type="number" placeholder="Nhập số lượng...">
                <template #trailing>
                  <span class="text-sm font-medium text-slate-500">{{
                    movementSelectedItem?.unit || '...'
                  }}</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField label="Ghi chú">
              <UTextarea
                v-model="movementNote"
                placeholder="VD: Nhập từ nhà cung cấp..."
                :rows="2"
              />
            </UFormField>
            <div class="mt-6 flex justify-end gap-3">
              <UButton variant="outline" color="neutral" @click="showImportModal = false"
                >Hủy</UButton
              >
              <UButton
                color="success"
                :loading="movementSubmitting"
                :disabled="!movementItemId || !movementQuantity"
                @click="handleImportSubmit"
              >
                <UIcon name="i-lucide-arrow-down-to-line" class="mr-1 h-4 w-4" />
                Nhập kho
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Export Modal -->
      <UModal v-model:open="showExportModal" title="Xuất kho">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Nguyên liệu" required>
              <USelectMenu
                v-model="movementItemId"
                :items="movementOptions"
                value-key="value"
                placeholder="Chọn nguyên liệu..."
                searchable
                class="w-full"
              />
            </UFormField>
            <Transition name="fade">
              <div
                v-if="movementSelectedItem"
                class="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/30 rounded-xl border p-3"
              >
                <div class="flex items-center justify-between">
                  <p class="text-surface-foreground text-xs font-medium">Tồn kho hiện tại</p>
                  <p
                    class="text-sm font-bold tabular-nums"
                    :class="
                      movementExceedsStock
                        ? 'text-error-600 dark:text-error-400'
                        : 'text-primary-600 dark:text-primary-400'
                    "
                  >
                    {{ formatNumber(movementSelectedItem.currentStock || 0) }}
                    {{ movementSelectedItem.unit }}
                  </p>
                </div>
              </div>
            </Transition>
            <UFormField label="Số lượng xuất" required>
              <UInput v-model="movementQuantity" type="number" placeholder="Nhập số lượng...">
                <template #trailing>
                  <span class="text-sm font-medium text-slate-500">{{
                    movementSelectedItem?.unit || '...'
                  }}</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField label="Ghi chú">
              <UTextarea v-model="movementNote" placeholder="VD: Xuất sản xuất..." :rows="2" />
            </UFormField>
            <div class="mt-6 flex justify-end gap-3">
              <UButton variant="outline" color="neutral" @click="showExportModal = false"
                >Hủy</UButton
              >
              <UButton
                color="primary"
                :loading="movementSubmitting"
                :disabled="!movementItemId || !movementQuantity || movementExceedsStock"
                @click="handleExportSubmit"
              >
                <UIcon name="i-lucide-arrow-up-from-line" class="mr-1 h-4 w-4" />
                Xuất kho
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
