<script setup lang="ts">
import { ProductStatus } from '~/utils/enums'
import type { Product, Category } from '~/utils/types'
import { mockProducts, mockCategories } from '~/utils/mockData'
const toast = useToast()
const _router = useRouter()
useSeoMeta({ title: `Sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })
// ─── Local reactive data (mock) ───────────────────────────────
const allProducts = ref<Product[]>(mockProducts.filter((p) => !p.deleted_at))
const categories = ref<Category[]>(mockCategories)
const loading = ref(true)
const error = ref(false)
// ─── Filters / pagination state ───────────────────────────────
const search = ref('')
const statusFilter = ref<'ALL' | ProductStatus>('ALL')
const categoryFilter = ref<string>('ALL')
const sortBy = ref<'name' | 'price' | 'stock' | 'status' | 'created_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)
const debouncedSearch = ref('')
const searchTimeoutId = ref<ReturnType<typeof setTimeout>>()
watch(search, (val) => {
  clearTimeout(searchTimeoutId.value)
  searchTimeoutId.value = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})
// ─── CRUD state ────────────────────────────────────────────────
const showDrawer = ref(false)
const targetProduct = ref<Product | null>(null)
const deleteTarget = ref<Product | null>(null)
const deleting = ref(false)
// ─── Simulate loading ──────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

const inventoryValue = computed(() => allProducts.value.reduce((s, p) => s + p.price * p.stock, 0))
// ─── Filtered + sorted + paginated rows ─────────────────────────
const filteredRows = computed(() => {
  let rows = allProducts.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q))
  }
  if (statusFilter.value !== 'ALL') rows = rows.filter((p) => p.status === statusFilter.value)
  if (categoryFilter.value !== 'ALL')
    rows = rows.filter((p) => p.category_id === categoryFilter.value)
  return [...rows].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    switch (sortBy.value) {
      case 'name':
        av = a.name
        bv = b.name
        break
      case 'price':
        av = a.price
        bv = b.price
        break
      case 'stock':
        av = a.stock
        bv = b.stock
        break
      case 'status':
        av = a.status
        bv = b.status
        break
      case 'created_at':
        av = a.created_at
        bv = b.created_at
        break
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDirection.value === 'asc' ? av - bv : bv - av
    }
    return sortDirection.value === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
})
const total = computed(() => filteredRows.value.length)
const _totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})
watch([debouncedSearch, statusFilter, categoryFilter], () => {
  page.value = 1
})
// ─── CRUD handlers ─────────────────────────────────────────────
function openAdd() {
  targetProduct.value = null
  showDrawer.value = true
}
function openEdit(row: Product) {
  targetProduct.value = row
  showDrawer.value = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSaveProduct(data: any) {
  const slug = data.slug || slugify(data.name)
  const cat = categories.value.find((c) => c.id === data.category_id) || null
  const imageUrl = data.imagePreview || `https://picsum.photos/seed/buntech-${Date.now()}/600/600`

  if (targetProduct.value) {
    const idx = allProducts.value.findIndex((p) => p.id === targetProduct.value?.id)
    if (idx !== -1) {
      allProducts.value[idx] = {
        ...allProducts.value[idx],
        ...data,
        slug,
        category: cat,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      } as Product
    }
    toast.add({ title: 'Cập nhật sản phẩm thành công', color: 'success' })
  } else {
    const newId = `prd-new-${Date.now()}`
    allProducts.value.unshift({
      ...data,
      id: newId,
      slug,
      category: cat,
      image_url: imageUrl,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    toast.add({ title: 'Thêm sản phẩm thành công', color: 'success' })
  }
}
function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    allProducts.value = allProducts.value.filter((p) => p.id !== deleteTarget.value?.id)
    toast.add({ title: 'Đã chuyển sản phẩm vào thùng rác', color: 'success' })
    deleteTarget.value = null
    deleting.value = false
    if (pagedRows.value.length === 0 && page.value > 1) page.value--
  }, 400)
}
function _toggleSort(col: 'name' | 'price' | 'stock' | 'status' | 'created_at') {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}
const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa sản phẩm "${deleteTarget.value.name}"? Sản phẩm sẽ được chuyển vào thùng rác.`
    : ''
)
const categoryOptions = computed(() => [
  { value: 'ALL', label: 'Tất cả danh mục' },
  ...categories.value.map((c) => ({ value: c.id, label: c.name }))
])
const columns = ref<Record<string, unknown>[]>([
  { accessorKey: 'image_url', header: 'Ảnh', width: '60px' },
  { accessorKey: 'name', header: 'Tên sản phẩm', sortable: true },
  { accessorKey: 'category', header: 'Danh mục', sortable: true },
  { accessorKey: 'price', header: 'Giá', align: 'right' as const, sortable: true },
  { accessorKey: 'stock', header: 'Tồn kho', align: 'right' as const, sortable: true },
  { accessorKey: 'status', header: 'Trạng thái', sortable: true },
  { accessorKey: 'actions', header: 'Thao tác', align: 'right' as const, width: '120px' }
])
</script>
<template>
  <div>
    <BasePageHeader title="Sản phẩm" description="Quản lý danh mục sản phẩm, giá và tồn kho">
      <template #actions>
        <UButton
          to="/admin/products/categories"
          color="neutral"
          variant="outline"
          icon="i-lucide-layers"
        >
          Danh mục
        </UButton>
        <UButton
          to="/admin/products/reviews"
          color="neutral"
          variant="outline"
          icon="i-lucide-star"
        >
          Đánh giá
        </UButton>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd">Thêm sản phẩm</UButton>
      </template>
    </BasePageHeader>
    <BaseEmptyState
      v-if="error"
      title="Lỗi"
      description="Không thể tải danh sách sản phẩm."
      icon="i-lucide-alert-triangle"
    />
    <template v-else>
      <!-- KPI Row -->
      <ProductKpiCards :products="allProducts" :loading="loading" />
      <!-- Inventory value banner -->
      <div
        v-if="!loading"
        class="card stagger-item mb-4 flex items-center justify-between p-4"
        style="animation-delay: 180ms"
      >
        <div class="flex items-center gap-3">
          <div
            class="bg-accent-50 dark:bg-accent-900/20 ring-accent-100 dark:ring-accent-900/30 flex h-10 w-10 items-center justify-center rounded-lg ring-1"
          >
            <span
              class="i-lucide-boxes text-accent-600 dark:text-accent-400 h-5 w-5"
              aria-hidden="true"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Tổng giá trị tồn kho
            </p>
            <p class="text-surface-foreground text-lg font-bold tabular-nums">
              {{ formatVND(inventoryValue) }}
            </p>
          </div>
        </div>
        <UBadge color="info" variant="subtle">
          <template #leading><span class="h-1.5 w-1.5 rounded-full bg-current" /></template>
          Cập nhật theo thời gian thực
        </UBadge>
      </div>
      <!-- Toolbar -->
      <div
        class="bg-surface ring-surface-border flex flex-col items-center gap-3 rounded-t-xl p-3 ring-1 sm:flex-row"
      >
        <BaseSearchInput
          v-model="search"
          placeholder="Tìm sản phẩm..."
          class="w-full max-w-sm flex-1"
        />
        <USelectMenu
          v-model="statusFilter"
          :items="[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: ProductStatus.ACTIVE, label: 'Đang bán' },
            { value: ProductStatus.INACTIVE, label: 'Ngừng bán' }
          ]"
          value-key="value"
          label-key="label"
          class="w-full sm:w-48"
        />
        <USelectMenu
          v-model="categoryFilter"
          :items="categoryOptions"
          value-key="value"
          label-key="label"
          class="w-full sm:w-48"
        />
      </div>
      <!-- Table -->
      <div
        class="animate-fade-in-up bg-surface ring-surface-border ring-t-0 overflow-hidden rounded-b-xl ring-1"
        style="animation-delay: 100ms"
      >
        <UTable :columns="columns as any" :data="pagedRows" :loading="loading">
          <template #image_url-cell="{ row }">
            <div
              class="bg-surface-hover ring-surface-border group flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg ring-1"
              @click="
                () => {
                  navigateTo(`/admin/products/${row.original.id}`)
                }
              "
            >
              <NuxtImg
                v-if="row.original.image_url"
                :src="row.original.image_url"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <span
                v-else
                class="i-lucide-image h-5 w-5 text-slate-300 transition-transform duration-300 group-hover:scale-110 dark:text-zinc-600"
                aria-hidden="true"
              />
            </div>
          </template>
          <template #name-cell="{ row }">
            <div
              class="min-w-0"
              style="cursor: pointer"
              @click="
                () => {
                  navigateTo(`/admin/products/${row.original.id}`)
                }
              "
            >
              <p
                class="text-surface-foreground hover:text-primary-600 max-w-[260px] truncate font-medium transition-colors"
              >
                {{ row.original.name }}
              </p>
              <p class="max-w-[260px] truncate font-mono text-xs text-slate-500 dark:text-zinc-400">
                {{ row.original.slug }}
              </p>
            </div>
          </template>
          <template #category-cell="{ row }">
            <UBadge color="info" variant="subtle">{{ row.original.category?.name || '—' }}</UBadge>
          </template>
          <template #price-cell="{ row }">
            <span class="text-surface-foreground font-medium tabular-nums">{{
              formatVND(Number(row.original.price))
            }}</span>
          </template>
          <template #stock-cell="{ row }">
            <div class="flex items-center justify-end gap-1.5">
              <span
                v-if="row.original.stock === 0"
                class="text-error-600 dark:text-error-400 font-medium tabular-nums"
                >Hết hàng</span
              >
              <span
                v-else-if="row.original.stock < 10"
                class="text-warning-600 dark:text-warning-400 flex items-center gap-1 font-medium tabular-nums"
              >
                <span class="i-lucide-alert-triangle h-3.5 w-3.5" aria-hidden="true" />
                {{ row.original.stock }}
              </span>
              <span v-else class="text-surface-foreground font-medium tabular-nums">{{
                row.original.stock
              }}</span>
              <span class="text-xs text-slate-400 dark:text-zinc-500">{{ row.original.unit }}</span>
            </div>
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="row.original.status === ProductStatus.ACTIVE ? 'success' : 'neutral'"
              variant="subtle"
            >
              <template #leading><span class="h-1.5 w-1.5 rounded-full bg-current" /></template>
              {{ row.original.status === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngừng bán' }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-eye"
                size="sm"
                @click="
                  () => {
                    navigateTo(`/admin/products/${row.original.id}`)
                  }
                "
              />
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                size="sm"
                @click="openEdit(row.original)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                size="sm"
                @click="
                  () => {
                    deleteTarget = row.original
                  }
                "
              />
            </div>
          </template>
        </UTable>
        <div
          class="border-surface-border bg-surface flex items-center justify-between border-t p-4"
        >
          <span class="text-sm text-slate-500">
            Hiển thị {{ total === 0 ? 0 : (page - 1) * limit + 1 }}-{{
              Math.min(page * limit, total)
            }}
            của {{ total }}
          </span>
          <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
        </div>
      </div>
    </template>
    <!-- Add/Edit Drawer -->
    <ProductFormDrawer
      v-model:open="showDrawer"
      :product="targetProduct"
      :categories="categories"
      @save="handleSaveProduct"
    />
    <BaseConfirmDialog
      :open="!!deleteTarget"
      title="Xóa sản phẩm"
      :description="deleteConfirmMessage"
      confirm-text="Xóa"
      cancel-text="Hủy"
      color="error"
      :loading="deleting"
      @update:open="!$event && (deleteTarget = null)"
      @confirm="confirmDelete"
      @update:model-value="!$event && (deleteTarget = null)"
    />
  </div>
</template>
