<script setup lang="ts">
import type { Category } from '~/utils/types'
import { mockCategories, mockProducts } from '~/utils/mockData'

const toast = useToast()
const { formatDate, slugify } = useFormat()

useSeoMeta({ title: `Danh mục sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const categories = ref<Category[]>([...mockCategories])
const products = ref([...mockProducts])

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', slug: '' })
const saving = ref(false)
const deleteTarget = ref<Category | null>(null)
const deleting = ref(false)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── Product count per category ──────────────────────────
function productCount(catId: string): number {
  return products.value.filter(p => p.category_id === catId).length
}

function activeProductCount(catId: string): number {
  return products.value.filter(p => p.category_id === catId && p.status === 'ACTIVE' && !p.deleted_at).length
}

// ─── CRUD ───────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '' }
  showModal.value = true
}

function openEdit(cat: Category) {
  editingId.value = cat.id
  form.value = { name: cat.name, slug: cat.slug }
  showModal.value = true
}

function save() {
  if (!form.value.name.trim()) {
    toast.add({ title: 'Vui lòng nhập tên danh mục', color: 'error' })
    return
  }
  saving.value = true
  const slug = form.value.slug.trim() || slugify(form.value.name)
  setTimeout(() => {
    if (editingId.value) {
      const idx = categories.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) {
        categories.value[idx] = { ...categories.value[idx], name: form.value.name.trim(), slug } as Category
      }
      toast.add({ title: 'Đã cập nhật danh mục', color: 'success' })
    } else {
      categories.value.push({
        id: `cat-${Date.now()}`,
        name: form.value.name.trim(),
        slug,
        created_at: new Date().toISOString(),
      })
      toast.add({ title: 'Đã thêm danh mục mới', color: 'success' })
    }
    showModal.value = false
    saving.value = false
  }, 400)
}

function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    categories.value = categories.value.filter(c => c.id !== deleteTarget.value!.id)
    toast.add({ title: 'Đã xóa danh mục', color: 'success' })
    deleteTarget.value = null
    deleting.value = false
  }, 400)
}

const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa danh mục "${deleteTarget.value.name}"? Các sản phẩm thuộc danh mục này sẽ không bị xóa.`
    : '',
)

const isDeleteModalOpen = computed({
  get: () => !!deleteTarget.value,
  set: (val) => { if (!val) deleteTarget.value = null }
})
</script>

<template>
  <div>
    <BasePageHeader title="Danh mục sản phẩm" description="Phân loại sản phẩm bún, phở, miến...">
      <template #actions>
        <UButton @click="openAdd" icon="i-lucide-plus" color="primary">
          Thêm danh mục
        </UButton>
      </template>
    </BasePageHeader>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      <div class="card p-4 stagger-item" style="animation-delay: 0ms">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <span class="i-lucide-folder-open w-[18px] h-[18px] text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng danh mục</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ categories.length }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4 stagger-item" style="animation-delay: 40ms">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
            <span class="i-lucide-package w-[18px] h-[18px] text-info-600 dark:text-info-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng sản phẩm</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ products.length }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4 stagger-item col-span-2 sm:col-span-1" style="animation-delay: 80ms">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
            <span class="i-lucide-hash w-[18px] h-[18px] text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">TB SP/danh mục</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ categories.length ? Math.round(products.length / categories.length) : 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Grid -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="card p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="skeleton h-10 w-10 rounded-lg" />
            <div class="flex-1">
              <div class="skeleton h-4 mb-1.5" />
              <div class="skeleton h-3 w-1/2" />
            </div>
          </div>
          <div class="skeleton h-3 mb-2" />
          <div class="skeleton h-3 w-2/3" />
        </div>
      </div>
    </template>

    <template v-else-if="categories.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(cat, idx) in categories"
          :key="cat.id"
          class="card card-hover p-5 stagger-item group"
          :style="{ animationDelay: `${idx * 40}ms` }"
        >
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <span class="i-lucide-tag w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-surface-foreground truncate">{{ cat.name }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500 font-mono truncate">{{ cat.slug }}</p>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <button
                class="p-2 min-w-[36px] min-h-[36px] text-slate-400 dark:text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Sửa danh mục"
                @click="openEdit(cat)"
              >
                <span class="i-lucide-pencil w-4 h-4" aria-hidden="true" />
              </button>
              <button
                class="p-2 min-w-[36px] min-h-[36px] text-slate-400 dark:text-zinc-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Xóa danh mục"
                @click="deleteTarget = cat"
              >
                <span class="i-lucide-trash-2 w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-surface-border">
            <div class="flex items-center gap-1.5">
              <span class="i-lucide-package w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              <span class="text-sm font-medium text-surface-foreground tabular-nums">{{ productCount(cat.id) }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">sản phẩm</span>
            </div>
            <div class="w-px h-3 bg-surface-border" aria-hidden="true" />
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-success-500" aria-hidden="true" />
              <span class="text-sm font-medium text-surface-foreground tabular-nums">{{ activeProductCount(cat.id) }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">đang bán</span>
            </div>
            <span class="text-xs text-slate-400 dark:text-zinc-500 ml-auto tabular-nums">{{ formatDate(cat.created_at) }}</span>
          </div>
        </div>
      </div>
    </template>

    <BaseEmptyState
      v-else
      title="Chưa có danh mục nào"
      description="Tạo danh mục để phân loại sản phẩm bún, phở, miến..."
      icon="i-lucide-folder"
    >
      <template #action>
        <UButton @click="openAdd" color="primary">Thêm danh mục</UButton>
      </template>
    </BaseEmptyState>

    <!-- Add/Edit Modal -->
    <UModal v-model:open="showModal" :title="editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'">
      <template #body>
        <form class="space-y-4" @submit.prevent="save">
          <UFormField label="Tên danh mục" required>
            <UInput v-model="form.name" placeholder="VD: Bún tươi, Phở tươi..." autofocus />
          </UFormField>
          <UFormField label="Đường dẫn (slug)" help="Để trống để tự tạo từ tên danh mục">
            <UInput v-model="form.slug" placeholder="tu-dong-tao-tu-ten" />
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton color="neutral" variant="ghost" @click="() => { showModal = false }">Hủy</UButton>
          <UButton :loading="saving" @click="save" color="primary">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteModalOpen" title="Xóa danh mục">
      <template #body>
        <p>{{ deleteConfirmMessage }}</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton color="neutral" variant="ghost" @click="() => { isDeleteModalOpen = false }">Hủy</UButton>
          <UButton color="error" @click="confirmDelete" :loading="deleting">Xóa</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
