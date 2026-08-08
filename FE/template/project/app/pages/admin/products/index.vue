<script setup lang="ts">
import {
  Plus, Pencil, Trash2, Eye, Package, PackageCheck, PackageX, AlertTriangle,
  TrendingUp, Boxes, Layers, Star, Image as ImageIcon,
} from 'lucide-vue-next'
import { ProductStatus } from '../../../core/enums'
import type { Product, Category } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatNumber, slugify } = useFormat()

useHead({ title: `Sản phẩm - BunTech Admin` })
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

const debouncedSearch = useDebounce(search, 300)

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
const imageFile = ref<File | null>(null)
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
    { label: 'Tổng sản phẩm', value: formatNumber(list.length), icon: Package, accent: 'bg-gradient-to-r from-primary-500 to-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', trend: '+8%' },
    { label: 'Đang bán', value: formatNumber(active), icon: PackageCheck, accent: 'bg-gradient-to-r from-success-500 to-success-400', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', trend: '+4%' },
    { label: 'Ngừng bán', value: formatNumber(inactive), icon: PackageX, accent: 'bg-gradient-to-r from-gray-500 to-gray-400', bg: 'bg-gray-50 dark:bg-zinc-900/40', text: 'text-gray-600 dark:text-zinc-300', ring: 'ring-gray-100 dark:ring-zinc-800', trend: '0%' },
    { label: 'Tồn kho thấp', value: formatNumber(lowStock), icon: AlertTriangle, accent: 'bg-gradient-to-r from-warning-500 to-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', trend: '+2' },
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
  imageFile.value = null
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
  imageFile.value = null
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
        }
      }
      toast.success('Cập nhật sản phẩm thành công')
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
      toast.success('Thêm sản phẩm thành công')
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
    toast.success('Đã chuyển sản phẩm vào thùng rác')
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

function onImageUpdatePreview(val: string | null) {
  imagePreview.value = val
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

const columns = computed(() => [
  { key: 'image_url', label: 'Ảnh', width: '64px' },
  { key: 'name', label: 'Sản phẩm', sortable: true },
  { key: 'category', label: 'Danh mục' },
  { key: 'price', label: 'Giá', align: 'right' as const, sortable: true },
  { key: 'stock', label: 'Tồn kho', align: 'right' as const, sortable: true },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'actions', label: 'Thao tác', align: 'right' as const, width: '120px', hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Sản phẩm" subtitle="Quản lý danh mục sản phẩm, giá và tồn kho" breadcrumb-label="Sản phẩm">
      <template #actions>
        <NuxtLink to="/admin/products/categories">
          <AppButton variant="outline"><Layers class="w-4 h-4" aria-hidden="true" /> Danh mục</AppButton>
        </NuxtLink>
        <NuxtLink to="/admin/products/reviews">
          <AppButton variant="outline"><Star class="w-4 h-4" aria-hidden="true" /> Đánh giá</AppButton>
        </NuxtLink>
        <AppButton @click="openAdd"><Plus class="w-4 h-4" aria-hidden="true" /> Thêm sản phẩm</AppButton>
      </template>
    </AppPageHeader>

    <AppErrorState v-if="error" message="Không thể tải danh sách sản phẩm." @retry="loading = true; error = false" />

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
              <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                <TrendingUp class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
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
            <Boxes class="w-5 h-5 text-accent-600 dark:text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng giá trị tồn kho</p>
            <p class="text-lg font-bold text-surface-foreground tabular-nums">{{ formatVND(inventoryValue) }}</p>
          </div>
        </div>
        <AppBadge color="accent" variant="soft" :dot="true">Cập nhật theo thời gian thực</AppBadge>
      </div>

      <!-- Toolbar -->
      <AppToolbar>
        <template #search>
          <AppSearchBar v-model="search" placeholder="Tìm sản phẩm..." />
        </template>
        <AppSelect
          v-model="statusFilter"
          :options="[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: ProductStatus.ACTIVE, label: 'Đang bán' },
            { value: ProductStatus.INACTIVE, label: 'Ngừng bán' },
          ]"
        />
        <AppSelect v-model="categoryFilter" :options="categoryOptions" />
      </AppToolbar>

      <!-- Table -->
      <div class="animate-fade-in-up" style="animation-delay: 100ms">
        <AppTable
          :columns="columns"
          :rows="pagedRows as unknown as Record<string, unknown>[]"
          :loading="loading"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          row-key="id"
          empty-title="Không tìm thấy sản phẩm"
          empty-description="Thử đổi bộ lọc hoặc thêm sản phẩm mới."
          @sort="toggleSort"
          @row-dbl-click="(row) => router.push(`/admin/products/${row.id}`)"
        >
          <template #cell-image_url="{ value }">
            <div class="w-11 h-11 rounded-lg bg-surface-hover overflow-hidden flex items-center justify-center ring-1 ring-surface-border">
              <img v-if="value" :src="value as string" :alt="''" class="w-full h-full object-cover" loading="lazy">
              <ImageIcon v-else class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </template>

          <template #cell-name="{ row }">
            <div class="min-w-0">
              <p class="font-medium text-surface-foreground truncate max-w-[260px]">{{ (row as Product).name }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[260px] font-mono">{{ (row as Product).slug }}</p>
            </div>
          </template>

          <template #cell-category="{ value }">
            <AppBadge color="info" variant="soft">{{ (value as Category)?.name || '—' }}</AppBadge>
          </template>

          <template #cell-price="{ value }">
            <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND(Number(value)) }}</span>
          </template>

          <template #cell-stock="{ row }">
            <div class="flex items-center justify-end gap-1.5">
              <span v-if="(row as Product).stock === 0" class="font-medium text-danger-600 dark:text-danger-400 tabular-nums">Hết hàng</span>
              <span v-else-if="(row as Product).stock < 10" class="font-medium text-warning-600 dark:text-warning-400 tabular-nums flex items-center gap-1">
                <AlertTriangle class="w-3.5 h-3.5" aria-hidden="true" /> {{ (row as Product).stock }}
              </span>
              <span v-else class="font-medium text-surface-foreground tabular-nums">{{ (row as Product).stock }}</span>
              <span class="text-xs text-slate-400 dark:text-zinc-500">{{ (row as Product).unit }}</span>
            </div>
          </template>

          <template #cell-status="{ value }">
            <AppBadge :color="value === ProductStatus.ACTIVE ? 'success' : 'gray'" :dot="true">
              {{ value === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngừng bán' }}
            </AppBadge>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1" @click.stop>
              <AppIconButton :icon="Eye" label="Xem" variant="view" @click.stop="router.push(`/admin/products/${(row as Product).id}`)" />
              <AppIconButton :icon="Pencil" label="Sửa" variant="edit" @click.stop="openEdit(row as Product)" />
              <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click.stop="deleteTarget = row as Product" />
            </div>
          </template>

          <!-- Mobile card layout -->
          <template #mobile-row="{ row }">
            <div class="flex gap-3">
              <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted ring-1 ring-surface-border">
                <img v-if="(row as Product).image_url" :src="(row as Product).image_url || ''" :alt="(row as Product).name" class="w-full h-full object-cover" loading="lazy">
                <div v-else class="w-full h-full flex items-center justify-center">
                  <ImageIcon class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                </div>
              </div>
              <div class="flex-1 min-w-0 space-y-1.5">
                <p class="font-medium text-surface-foreground line-clamp-1">{{ (row as Product).name }}</p>
                <AppBadge color="info" variant="soft">{{ (row as Product).category?.name || '—' }}</AppBadge>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND((row as Product).price) }}</span>
                  <span :class="['text-xs tabular-nums', (row as Product).stock === 0 ? 'text-danger-600 dark:text-danger-400' : (row as Product).stock < 10 ? 'text-warning-600 dark:text-warning-400' : 'text-slate-500 dark:text-zinc-400']">
                    Tồn: {{ (row as Product).stock }} {{ (row as Product).unit }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1 flex-shrink-0">
                <AppIconButton :icon="Pencil" label="Sửa" variant="edit" @click.stop="openEdit(row as Product)" />
                <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click.stop="deleteTarget = row as Product" />
              </div>
            </div>
          </template>

          <template #pagination>
            <AppPagination
              :page="page"
              :total-pages="totalPages"
              :total="total"
              :from="total === 0 ? 0 : (page - 1) * limit + 1"
              :to="Math.min(page * limit, total)"
              :limit="limit"
              @update:page="page = $event"
              @update:limit="limit = $event; page = 1"
            />
          </template>
        </AppTable>
      </div>
    </template>

    <!-- Add/Edit Drawer -->
    <AppDrawer v-model="showDrawer" :title="editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'" width="max-w-lg">
      <form class="space-y-4" @submit.prevent="saveProduct">
        <AppDropzone v-model="imageFile" :preview="imagePreview || undefined" label="Ảnh sản phẩm" @update:preview="onImageUpdatePreview" @error="(msg: string) => toast.error(msg)" />
        <AppInput v-model="form.name" label="Tên sản phẩm" :required="true" :error="formErrors.name" @update:model-value="form.slug = slugify($event)" />
        <AppInput v-model="form.slug" label="Slug" hint="Tự động tạo từ tên sản phẩm" />
        <AppInput v-model="form.description" label="Mô tả" />
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.price" label="Giá (VND)" type="number" :required="true" :min="0" :step="1000" :error="formErrors.price" />
          <AppInput v-model="form.stock" label="Tồn kho" type="number" :required="true" :min="0" :error="formErrors.stock" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.unit" label="Đơn vị" />
          <AppSelect
            v-model="form.category_id"
            label="Danh mục"
            :options="[{ value: '', label: 'Chọn danh mục' }, ...categories.map(c => ({ value: c.id, label: c.name }))]"
          />
        </div>
        <AppSelect
          v-model="form.status"
          label="Trạng thái"
          :options="[
            { value: ProductStatus.ACTIVE, label: 'Đang bán' },
            { value: ProductStatus.INACTIVE, label: 'Ngừng bán' },
          ]"
        />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showDrawer = false">Hủy</AppButton>
        <AppButton :loading="saving" @click="saveProduct">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</AppButton>
      </template>
    </AppDrawer>

    <AppConfirmDialog
      :model-value="!!deleteTarget"
      title="Xóa sản phẩm"
      :message="deleteConfirmMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
