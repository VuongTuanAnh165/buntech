<script setup lang="ts">
import { Plus, Pencil, Trash2, Layers, FileText, FolderOpen, Hash } from 'lucide-vue-next'
import type { BlogCategory, BlogPost } from '../../../core/types'
import { mockBlogCategories, mockBlogPosts } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const { formatDate, slugify } = useFormat()

useHead({ title: `Danh mục blog - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const categories = ref<BlogCategory[]>([...mockBlogCategories])
const posts = ref<BlogPost[]>(mockBlogPosts.filter(p => !p.deleted_at))

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', slug: '' })
const saving = ref(false)
const deleteTarget = ref<BlogCategory | null>(null)
const deleting = ref(false)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── Post count per category ─────────────────────────────
function postCount(catId: string): number {
  return posts.value.filter(p => p.category_id === catId).length
}

function publishedCount(catId: string): number {
  return posts.value.filter(p => p.category_id === catId && p.status === 'PUBLISHED').length
}

// ─── CRUD ───────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '' }
  showModal.value = true
}

function openEdit(cat: BlogCategory) {
  editingId.value = cat.id
  form.value = { name: cat.name, slug: cat.slug }
  showModal.value = true
}

function save() {
  if (!form.value.name.trim()) {
    toast.error('Vui lòng nhập tên danh mục')
    return
  }
  saving.value = true
  const slug = form.value.slug.trim() || slugify(form.value.name)
  setTimeout(() => {
    if (editingId.value) {
      const idx = categories.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) {
        categories.value[idx] = { ...categories.value[idx], name: form.value.name.trim(), slug }
      }
      toast.success('Đã cập nhật danh mục')
    } else {
      categories.value.push({
        id: `bcat-${Date.now()}`,
        name: form.value.name.trim(),
        slug,
        created_at: new Date().toISOString(),
      })
      toast.success('Đã thêm danh mục mới')
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
    toast.success('Đã xóa danh mục')
    deleteTarget.value = null
    deleting.value = false
  }, 400)
}

const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa danh mục "${deleteTarget.value.name}"? Các bài viết thuộc danh mục này sẽ không bị xóa.`
    : '',
)
</script>

<template>
  <div>
    <AppPageHeader title="Danh mục blog" subtitle="Phân loại bài viết theo chủ đề" breadcrumb-label="Danh mục">
      <template #actions>
        <AppButton @click="openAdd">
          <Plus class="w-4 h-4" aria-hidden="true" /> Thêm danh mục
        </AppButton>
      </template>
    </AppPageHeader>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      <div class="card p-4 stagger-item" style="animation-delay: 0ms">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Layers class="w-[18px] h-[18px] text-primary-600 dark:text-primary-400" aria-hidden="true" />
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
            <FileText class="w-[18px] h-[18px] text-info-600 dark:text-info-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng bài viết</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ posts.length }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4 stagger-item col-span-2 sm:col-span-1" style="animation-delay: 80ms">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
            <Hash class="w-[18px] h-[18px] text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">TB bài/danh mục</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ categories.length ? Math.round(posts.length / categories.length) : 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Grid -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 5" :key="i" class="card p-5">
          <div class="flex items-center gap-3 mb-4">
            <AppSkeleton height="h-10" width="w-10" class="rounded-lg" />
            <div class="flex-1">
              <AppSkeleton height="h-4" class="mb-1.5" />
              <AppSkeleton height="h-3" width="w-1/2" />
            </div>
          </div>
          <AppSkeleton height="h-3" class="mb-2" />
          <AppSkeleton height="h-3" width="w-2/3" />
        </div>
      </div>
    </template>

    <template v-else-if="categories.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(cat, idx) in categories"
          :key="cat.id"
          class="card card-hover p-5 stagger-item group"
          :style="{ animationDelay: `${idx * 50}ms` }"
        >
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <FolderOpen class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
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
                <Pencil class="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                class="p-2 min-w-[36px] min-h-[36px] text-slate-400 dark:text-zinc-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Xóa danh mục"
                @click="deleteTarget = cat"
              >
                <Trash2 class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-surface-border">
            <div class="flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              <span class="text-sm font-medium text-surface-foreground tabular-nums">{{ postCount(cat.id) }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">bài viết</span>
            </div>
            <div class="w-px h-3 bg-surface-border" aria-hidden="true" />
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-success-500" aria-hidden="true" />
              <span class="text-sm font-medium text-surface-foreground tabular-nums">{{ publishedCount(cat.id) }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">đã XB</span>
            </div>
            <span class="text-xs text-slate-400 dark:text-zinc-500 ml-auto tabular-nums">{{ formatDate(cat.created_at) }}</span>
          </div>
        </div>
      </div>
    </template>

    <AppEmptyState
      v-else
      title="Chưa có danh mục nào"
      description="Tạo danh mục để phân loại bài viết theo chủ đề."
      :cta-text="'Thêm danh mục'"
      @action="openAdd"
    />

    <!-- Add/Edit Modal -->
    <AppModal v-model="showModal" :title="editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'" size="sm">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.name" label="Tên danh mục" placeholder="VD: Tin tức, Khuyến mãi..." :required="true" />
        <div>
          <label class="form-label" for="cat-slug">Đường dẫn (slug)</label>
          <input id="cat-slug" v-model="form.slug" type="text" class="form-input" placeholder="tu-dong-tao-tu-ten">
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1">Để trống để tự tạo từ tên danh mục</p>
        </div>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showModal = false">Hủy</AppButton>
        <AppButton :loading="saving" @click="save">{{ editingId ? 'Cập nhật' : 'Thêm mới' }}</AppButton>
      </template>
    </AppModal>

    <AppConfirmDialog
      :model-value="!!deleteTarget"
      title="Xóa danh mục"
      :message="deleteConfirmMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
