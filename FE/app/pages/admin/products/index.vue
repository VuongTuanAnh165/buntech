<script setup lang="ts">
import { ProductStatus } from '~/utils/enums'
import type { Product, Category } from '~/utils/types'
import { mockProducts, mockCategories } from '~/utils/mockData'

const toast = useToast()
const router = useRouter()
const { formatVND, formatNumber, slugify } = useFormat()

useSeoMeta({ title: `Sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── Local reactive data (mock) ───────────────────────────────
const allProducts = ref<Product[]>(mockProducts.filter(p => !p.deleted_at))
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
  searchTimeoutId.value = setTimeout(() => { debouncedSearch.value = val }, 300)
})

// ─── CRUD state ────────────────────────────────────────────────
const showDrawer = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  slug: '',
  description: '',
  price: 0,
  stock: 0,
  unit: 'kg',
  category_id: '' as string,
  status: ProductStatus.ACTIVE,
  image_url: '',
})
const imagePreview = ref<string | null>(null)
const formErrors = ref<Record<string, string>>({})
const saving = ref(false)
const deleteTarget = ref<Product | null>(null)
const deleting = ref(false)

// ─── Simulate loading ──────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── KPI cards ─────────────────────────────────────────────────
const kpiCards = computed(() => {
  const list = allProducts.value
  const active = list.filter(p => p.status === ProductStatus.ACTIVE).length
  const inactive = list.filter(p => p.status === ProductStatus.INACTIVE).length
  const lowStock = list.filter(p => p.stock > 0 && p.stock < 10).length
  return [
    { label: 'Tổng sản phẩm', value: formatNumber(list.length), icon: 'i-lucide-package', accent: 'bg-gradient-to-r from-primary-500 to-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', trend: '+8%' },
    { label: 'Đang bán', value: formatNumber(active), icon: 'i-lucide-package-check', accent: 'bg-gradient-to-r from-success-500 to-success-400', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', trend: '+4%' },
    { label: 'Ngừng bán', value: formatNumber(inactive), icon: 'i-lucide-package-x', accent: 'bg-gradient-to-r from-gray-500 to-gray-400', bg: 'bg-gray-50 dark:bg-zinc-900/40', text: 'text-gray-600 dark:text-zinc-300', ring: 'ring-gray-100 dark:ring-zinc-800', trend: '0%' },
    { label: 'Tồn kho thấp', value: formatNumber(lowStock), icon: 'i-lucide-alert-triangle', accent: 'bg-gradient-to-r from-warning-500 to-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', trend: '+2' },
  ]
})

const inventoryValue = computed(() => allProducts.value.reduce((s, p) => s + p.price * p.stock, 0))

// ─── Filtered + sorted + paginated rows ─────────────────────────
const filteredRows = computed(() => {
  let rows = allProducts.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    rows = rows.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.slug.includes(q)
    )
  }
  if (statusFilter.value !== 'ALL') rows = rows.filter(p => p.status === statusFilter.value)
  if (categoryFilter.value !== 'ALL') rows = rows.filter(p => p.category_id === categoryFilter.value)

  return [...rows].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    switch (sortBy.value) {
      case 'name': av = a.name; bv = b.name; break
      case 'price': av = a.price; bv = b.price; break
      case 'stock': av = a.stock; bv = b.stock; break
      case 'status': av = a.status; bv = b.status; break
      case 'created_at': av = a.created_at; bv = b.created_at; break
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
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})

watch([debouncedSearch, statusFilter, categoryFilter], () => { page.value = 1 })

// ─── CRUD handlers ─────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '', description: '', price: 0, stock: 0, unit: 'kg', category_id: categories.value[0]?.id || '', status: ProductStatus.ACTIVE, image_url: '' }
  imagePreview.value = null
  formErrors.value = {}
  showDrawer.value = true
}

function openEdit(row: Product) {
  editingId.value = row.id
  form.value = {
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    price: row.price,
    stock: row.stock,
    unit: row.unit || 'kg',
    category_id: row.category_id || '',
    status: row.status,
    image_url: row.image_url || '',
  }
  imagePreview.value = row.image_url
  formErrors.value = {}
  showDrawer.value = true
}

function validateForm() {
  formErrors.value = {}
  if (!form.value.name.trim()) formErrors.value.name = 'Vui lòng nhập tên sản phẩm'
  if (form.value.price < 0) formErrors.value.price = 'Giá không hợp lệ'
  if (form.value.stock < 0) formErrors.value.stock = 'Tồn kho không hợp lệ'
  return Object.keys(formErrors.value).length === 0
}

function saveProduct() {
  if (!validateForm()) return
  saving.value = true
  setTimeout(() => {
    const slug = form.value.slug || slugify(form.value.name)
    const cat = categories.value.find(c => c.id === form.value.category_id) || null
    const imageUrl = imagePreview.value || form.value.image_url || `https://picsum.photos/seed/buntech-${Date.now()}/600/600`
    if (editingId.value) {
      const idx = allProducts.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) {
        allProducts.value[idx] = {
          ...allProducts.value[idx],
          name: form.value.name,
          slug,
          description: form.value.description,
          price: form.value.price,
          stock: form.value.stock,
          unit: form.value.unit,
          category_id: form.value.category_id || null,
          category: cat,
          status: form.value.status,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        } as Product
      }
      toast.add({ title: 'Cập nhật sản phẩm thành công', color: 'success' })
    } else {
      const newId = `prd-new-${Date.now()}`
      allProducts.value.unshift({
        id: newId,
        category_id: form.value.category_id || null,
        category: cat,
        name: form.value.name,
        slug,
        description: form.value.description,
        price: form.value.price,
        stock: form.value.stock,
        unit: form.value.unit,
        image_url: imageUrl,
        status: form.value.status,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.add({ title: 'Thêm sản phẩm thành công', color: 'success' })
    }
    saving.value = false
    showDrawer.value = false
  }, 400)
}

function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    allProducts.value = allProducts.value.filter(p => p.id !== deleteTarget.value?.id)
    toast.add({ title: 'Đã chuyển sản phẩm vào thùng rác', color: 'success' })
    deleteTarget.value = null
    deleting.value = false
    if (pagedRows.value.length === 0 && page.value > 1) page.value--
  }, 400)
}

function toggleSort(col: 'name' | 'price' | 'stock' | 'status' | 'created_at') {
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
  ...categories.value.map(c => ({ value: c.id, label: c.name })),
])

const columns = ref<any[]>([
  { accessorKey: 'image_url', header: 'Ảnh', width: '60px' },
  { accessorKey: 'name', header: 'Tên sản phẩm', sortable: true },
  { accessorKey: 'category', header: 'Danh mục', sortable: true },
  { accessorKey: 'price', header: 'Giá', align: 'right' as const, sortable: true },
  { accessorKey: 'stock', header: 'Tồn kho', align: 'right' as const, sortable: true },
  { accessorKey: 'status', header: 'Trạng thái', sortable: true },
  { accessorKey: 'actions', header: 'Thao tác', align: 'right' as const, width: '120px' },
])
</script>

<template>
  <div>
    <BasePageHeader title="Sản phẩm" description="Quản lý danh mục sản phẩm, giá và tồn kho">
      <template #actions>
        <UButton to="/admin/products/categories" color="neutral" variant="outline" icon="i-lucide-layers">
          Danh mục
        </UButton>
        <UButton to="/admin/products/reviews" color="neutral" variant="outline" icon="i-lucide-star">
          Đánh giá
        </UButton>
        <UButton @click="openAdd" icon="i-lucide-plus" color="primary">Thêm sản phẩm</UButton>
      </template>
    </BasePageHeader>

    <BaseEmptyState v-if="error" title="Lỗi" description="Không thể tải danh sách sản phẩm." icon="i-lucide-alert-triangle" />

    <template v-else>
      <!-- KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="card p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="skeleton h-10 w-10 rounded-xl" />
              <div class="flex-1"><div class="skeleton h-3 w-16" /></div>
            </div>
            <div class="skeleton h-3 mb-2" />
            <div class="skeleton h-6 w-2/3" />
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
                <span :class="['w-5 h-5', card.icon, card.text]" aria-hidden="true" />
              </div>
              <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                <span class="i-lucide-trending-up w-3 h-3" aria-hidden="true" /> {{ card.trend }}
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Inventory value banner -->
      <div v-if="!loading" class="card p-4 mb-4 stagger-item flex items-center justify-between" style="animation-delay: 180ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center ring-1 ring-accent-100 dark:ring-accent-900/30">
            <span class="i-lucide-boxes w-5 h-5 text-accent-600 dark:text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng giá trị tồn kho</p>
            <p class="text-lg font-bold text-surface-foreground tabular-nums">{{ formatVND(inventoryValue) }}</p>
          </div>
        </div>
        <UBadge color="info" variant="subtle">
          <template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>
          Cập nhật theo thời gian thực
        </UBadge>
      </div>

      <!-- Toolbar -->
      <div class="bg-surface p-3 rounded-t-xl ring-1 ring-surface-border flex flex-col sm:flex-row gap-3 items-center">
        <BaseSearchInput v-model="search" placeholder="Tìm sản phẩm..." class="flex-1 w-full max-w-sm" />
        <USelectMenu
          v-model="statusFilter"
          :items="[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: ProductStatus.ACTIVE, label: 'Đang bán' },
            { value: ProductStatus.INACTIVE, label: 'Ngừng bán' },
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
      <div class="animate-fade-in-up bg-surface ring-1 ring-surface-border ring-t-0 rounded-b-xl overflow-hidden" style="animation-delay: 100ms">
        <UTable
          :columns="columns"
          :data="pagedRows"
          :loading="loading"
        >
          <template #image_url-cell="{ row }">
            <div class="w-11 h-11 rounded-lg bg-surface-hover overflow-hidden flex items-center justify-center ring-1 ring-surface-border group cursor-pointer" @click="router.push(`/admin/products/${row.original.id}`)">
              <NuxtImg v-if="row.original.image_url" :src="row.original.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
              <span v-else class="i-lucide-image w-5 h-5 text-slate-300 dark:text-zinc-600 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            </div>
          </template>

          <template #name-cell="{ row }">
            <div class="min-w-0" @click="router.push(`/admin/products/${row.original.id}`)" style="cursor: pointer">
              <p class="font-medium text-surface-foreground truncate max-w-[260px] hover:text-primary-600 transition-colors">{{ row.original.name }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[260px] font-mono">{{ row.original.slug }}</p>
            </div>
          </template>

          <template #category-cell="{ row }">
            <UBadge color="info" variant="subtle">{{ row.original.category?.name || '—' }}</UBadge>
          </template>

          <template #price-cell="{ row }">
            <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND(Number(row.original.price)) }}</span>
          </template>

          <template #stock-cell="{ row }">
            <div class="flex items-center justify-end gap-1.5">
              <span v-if="row.original.stock === 0" class="font-medium text-error-600 dark:text-error-400 tabular-nums">Hết hàng</span>
              <span v-else-if="row.original.stock < 10" class="font-medium text-warning-600 dark:text-warning-400 tabular-nums flex items-center gap-1">
                <span class="i-lucide-alert-triangle w-3.5 h-3.5" aria-hidden="true" /> {{ row.original.stock }}
              </span>
              <span v-else class="font-medium text-surface-foreground tabular-nums">{{ row.original.stock }}</span>
              <span class="text-xs text-slate-400 dark:text-zinc-500">{{ row.original.unit }}</span>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === ProductStatus.ACTIVE ? 'success' : 'neutral'" variant="subtle">
              <template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>
              {{ row.original.status === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngừng bán' }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton color="neutral" variant="ghost" icon="i-lucide-eye" size="sm" @click="() => { router.push(`/admin/products/${row.original.id}`) }" />
              <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" size="sm" @click="openEdit(row.original)" />
              <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="sm" @click="() => { deleteTarget = row.original }" />
            </div>
          </template>
        </UTable>

        <div class="p-4 flex items-center justify-between border-t border-surface-border bg-surface">
          <span class="text-sm text-slate-500">
            Hiển thị {{ total === 0 ? 0 : (page - 1) * limit + 1 }}-{{ Math.min(page * limit, total) }} của {{ total }}
          </span>
          <UPagination v-model:page="page" :total="total" :items-per-page="limit" />
        </div>
      </div>
    </template>

    <!-- Add/Edit Drawer -->
    <USlideover v-model:open="showDrawer" :title="editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'">
      <template #body>
        <form class="space-y-4" @submit.prevent="saveProduct">
          <UFormField label="Tên sản phẩm" required :error="formErrors.name">
            <UInput v-model="form.name" @update:model-value="form.slug = slugify($event)" />
          </UFormField>
          <UFormField label="Slug" help="Tự động tạo từ tên sản phẩm">
            <UInput v-model="form.slug" />
          </UFormField>
          <UFormField label="Hình ảnh">
            <BaseDropzone v-model="imagePreview" help-text="Định dạng JPG, PNG, WEBP. Tối đa 5MB." />
          </UFormField>
          <UFormField label="Mô tả">
            <UTextarea v-model="form.description" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Giá (VND)" required :error="formErrors.price">
              <UInput v-model.number="form.price" type="number" :min="0" :step="1000" />
            </UFormField>
            <UFormField label="Tồn kho" required :error="formErrors.stock">
              <UInput v-model.number="form.stock" type="number" :min="0" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Đơn vị">
              <UInput v-model="form.unit" />
            </UFormField>
            <UFormField label="Danh mục">
              <USelectMenu
                v-model="form.category_id"
                :items="[{ value: '', label: 'Chọn danh mục' }, ...categories.map(c => ({ value: c.id, label: c.name }))]"
                value-key="value"
                label-key="label"
              />
            </UFormField>
          </div>
          <UFormField label="Trạng thái">
            <USelectMenu
              v-model="form.status"
              :items="[
                { value: ProductStatus.ACTIVE, label: 'Đang bán' },
                { value: ProductStatus.INACTIVE, label: 'Ngừng bán' },
              ]"
              value-key="value"
              label-key="label"
            />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton color="neutral" variant="ghost" @click="() => { showDrawer = false }">Hủy</UButton>
          <UButton :loading="saving" @click="saveProduct" color="primary">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</UButton>
        </div>
      </template>
    </USlideover>

    <BaseConfirmDialog
      :open="!!deleteTarget"
      @update:open="!$event && (deleteTarget = null)"
      title="Xóa sản phẩm"
      :description="deleteConfirmMessage"
      confirm-text="Xóa"
      cancel-text="Hủy"
      color="error"
      :loading="deleting"
      @confirm="confirmDelete"
      @update:model-value="!$event && (deleteTarget = null)"
    />
  </div>
</template>
