<script setup lang="ts">
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { mockProducts, mockCategories, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND } = useFormat()
useHead({ title: `${t('nav.products')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const { handleError } = useErrorHandler()
const rows = ref<Record<string, unknown>[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const statusFilter = ref('')
const categories = ref<Record<string, unknown>[]>([])

const showDrawer = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', slug: '', description: '', price: 0, stock: 0, unit: 'kg', category_id: '', status: 'ACTIVE', image_url: '' })
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const saving = ref(false)
const deleteTarget = ref<string | null>(null)

const debouncedSearch = useDebounce(search, 300)
watch([debouncedSearch, page, limit, sortBy, sortDirection, statusFilter], loadData)

async function loadCategories() {
  await new Promise(r => setTimeout(r, 300))
  categories.value = mockCategories.value.slice().sort((a, b) => a.name.localeCompare(b.name))
}

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = mockProducts.value.filter(p => !p.deleted_at)
    
    if (debouncedSearch.value) {
      const s = debouncedSearch.value.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(s))
    }
    if (statusFilter.value) data = data.filter(p => p.status === statusFilter.value)
    
    data.sort((a, b) => {
      const aVal = a[sortBy.value as keyof typeof a]
      const bVal = b[sortBy.value as keyof typeof b]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const asc = sortDirection.value === 'asc' ? 1 : -1
      return (aVal < bVal ? -1 : 1) * asc
    })
    
    total.value = data.length
    
    const paginated = data.slice((page.value - 1) * limit.value, page.value * limit.value)
    rows.value = paginated.map(p => ({
      ...p,
      category: mockCategories.value.find(c => c.id === p.category_id) || null
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '', description: '', price: 0, stock: 0, unit: 'kg', category_id: '', status: 'ACTIVE', image_url: '' }
  imageFile.value = null
  imagePreview.value = null
  showDrawer.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as string
  form.value = {
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string || '',
    price: Number(row.price),
    stock: Number(row.stock),
    unit: row.unit as string || 'kg',
    category_id: row.category_id as string || '',
    status: row.status as string || 'ACTIVE',
    image_url: row.image_url as string || '',
  }
  imageFile.value = null
  imagePreview.value = form.value.image_url
  showDrawer.value = true
}

async function saveProduct() {
  if (!form.value.name) { toast.error(t('common.required')); return }
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const { slugify } = useFormat()
    const slug = form.value.slug || slugify(form.value.name)
    const payload = {
      name: form.value.name,
      slug,
      description: form.value.description,
      price: form.value.price,
      stock: form.value.stock,
      unit: form.value.unit,
      category_id: form.value.category_id || null,
      status: form.value.status as 'ACTIVE' | 'INACTIVE',
      image_url: form.value.image_url,
    }
    
    if (editingId.value) {
      const index = mockProducts.value.findIndex(p => p.id === editingId.value)
      if (index !== -1) {
        mockProducts.value[index] = { ...mockProducts.value[index], ...payload, updated_at: new Date().toISOString() }
      }
    } else {
      mockProducts.value.push({
        id: generateId(),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        average_rating: 0,
        review_count: 0
      })
    }
    toast.success(t('products.saveSuccess'))
    showDrawer.value = false
    loadData()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function deleteProduct() {
  if (!deleteTarget.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockProducts.value.findIndex(p => p.id === deleteTarget.value)
    if (index !== -1) {
      mockProducts.value[index].deleted_at = new Date().toISOString()
    }
    toast.success(t('products.deleteSuccess'))
    deleteTarget.value = null
    loadData()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

function toggleSort(col: string) {
  if (sortBy.value === col) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDirection.value = 'asc' }
}

onMounted(() => {
  loadCategories()
  loadData()
})

const columns = computed(() => [
  { key: 'image_url', label: t('common.image'), width: '60px' },
  { key: 'name', label: t('products.productName'), sortable: true },
  { key: 'category', label: t('common.category') },
  { key: 'price', label: t('common.price'), align: 'right' as const, sortable: true },
  { key: 'stock', label: t('products.stock'), align: 'right' as const, sortable: true },
  { key: 'status', label: t('common.status'), sortable: true },
  { key: 'actions', label: t('common.actions'), align: 'right' as const, width: '120px' },
])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.products') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('products.title') }}</h1>
      <div class="flex gap-2">
        <NuxtLink to="/admin/products/categories">
          <AppButton variant="outline">{{ t('products.categories') }}</AppButton>
        </NuxtLink>
        <NuxtLink to="/admin/products/reviews">
          <AppButton variant="outline">{{ t('products.reviews') }}</AppButton>
        </NuxtLink>
        <AppButton @click="openAdd"><Plus class="w-4 h-4" /> {{ t('products.addNew') }}</AppButton>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex-1 min-w-[200px] max-w-xs"><AppSearchBar v-model="search" /></div>
      <select v-model="statusFilter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value="">{{ t('common.all') }} {{ t('common.status') }}</option>
        <option value="ACTIVE">{{ t('common.active') }}</option>
        <option value="INACTIVE">{{ t('common.inactive') }}</option>
      </select>
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <AppTable v-else :columns="columns" :rows="rows" :loading="loading" :sort-by="sortBy" :sort-direction="sortDirection" row-key="id" @sort="toggleSort" @row-dbl-click="(row) => router.push(`/admin/products/${row.id}`)">
      <template #cell-image_url="{ value }">
        <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
          <img v-if="value" :src="value as string" :alt="''" class="w-full h-full object-cover">
          <svg v-else class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      </template>
      <template #cell-category="{ value }">
        {{ (value as Record<string, unknown>)?.name || '—' }}
      </template>
      <template #cell-price="{ value }">
        <span class="font-medium">{{ formatVND(Number(value)) }}</span>
      </template>
      <template #cell-stock="{ value }">
        <span :class="['font-medium', Number(value) === 0 ? 'text-danger-600' : '']">{{ Number(value) }} {{ t('products.unit') }}</span>
      </template>
      <template #cell-status="{ value }">
        <AppBadge :color="(value as string) === 'ACTIVE' ? 'success' : 'gray'">
          {{ (value as string) === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
        </AppBadge>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button class="p-1.5 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg" @click.stop="router.push(`/admin/products/${row.id}`)"><Eye class="w-4 h-4" /></button>
          <button class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" @click.stop="openEdit(row)"><Pencil class="w-4 h-4" /></button>
          <button class="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg" @click.stop="deleteTarget = row.id"><Trash2 class="w-4 h-4" /></button>
        </div>
      </template>
      <template #pagination>
        <AppPagination :page="page" :total-pages="totalPages" :total="total" :from="(page - 1) * limit" :to="page * limit - 1" :limit="limit" @update:page="page = $event" @update:limit="limit = $event; page = 1" />
      </template>
    </AppTable>

    <AppDrawer v-model="showDrawer" :title="editingId ? t('products.editProduct') : t('products.addProduct')" width="max-w-lg">
      <form class="space-y-4" @submit.prevent="saveProduct">
        <AppDropzone v-model="imageFile" :preview="imagePreview" :label="t('products.image')" @update:preview="imagePreview = $event" @error="(msg) => toast.error(msg)" />
        <AppInput v-model="form.name" :label="t('products.productName')" :required="true" />
        <AppInput v-model="form.slug" :label="t('common.slug')" :placeholder="t('common.slug')" />
        <AppInput v-model="form.description" :label="t('common.description')" />
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.price" :label="t('common.price')" type="number" :required="true" :min="0" />
          <AppInput v-model="form.stock" :label="t('products.stock')" type="number" :required="true" :min="0" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.unit" :label="t('common.unit')" />
          <AppSelect v-model="form.category_id" :label="t('common.category')" :options="categories.map(c => ({ value: c.id as string, label: c.name as string }))" :placeholder="t('common.category')" />
        </div>
        <AppSelect v-model="form.status" :label="t('common.status')" :options="[{ value: 'ACTIVE', label: t('common.active') }, { value: 'INACTIVE', label: t('common.inactive') }]" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showDrawer = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="saveProduct">{{ t('common.save') }}</AppButton>
      </template>
    </AppDrawer>

    <AppConfirmDialog :model-value="!!deleteTarget" :title="t('common.delete')" :message="t('products.deleteConfirm')" @confirm="deleteProduct" @cancel="deleteTarget = null" />
  </div>
</template>
